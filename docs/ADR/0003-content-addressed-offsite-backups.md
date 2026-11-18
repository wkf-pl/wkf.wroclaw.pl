# Content-addressed off-site backups

Status: accepted for immediate rollout.

## Context

The original off-site format stored a complete encrypted copy of every media blob in every backup.
Media accounts for most of the backup footprint and changes much more slowly than the PostgreSQL
database. Keeping independent media copies therefore consumed storage in proportion to the number
of snapshots, not to the amount of changed content.

The backup destination is deliberately less trusted than production. The FTPS identity remains a
write-only transfer identity, the long-lived `age` identity remains offline, and MyDevil must be
able to accept a backup without learning database data, media data, or original media names.

## Measurements and 12-month forecast

The decision uses the MyDevil inventory measured on 2026-10-25. It contains seven format-v2
recovery points from 2026-10-20 through 2026-10-24:

- total physical usage: 233,558 KiB;
- six recovery points: 33,198 KiB each;
- latest recovery point: 34,361 KiB;
- media: 30,352 KiB and 26 blobs initially, then 31,515 KiB and 27 blobs;
- encrypted database: 2,797 KiB in both sampled recovery points;
- encrypted manifest and signature: 31 KiB per recovery point.

This is a short real sample, not the 30-day sample originally requested by issues #41 and #42. The
owner explicitly accepted early implementation while the application is new and format-v2 backups
may still be discarded. The forecast therefore shows the measured baseline and its limits rather
than presenting it as a stable long-term growth rate.

| Scenario                                                         | 12-month or steady-state estimate | Result against 10 GiB                        |
| ---------------------------------------------------------------- | --------------------------------: | -------------------------------------------- |
| Daily full copies, no retention, latest size held constant       |          11.96 GiB after 365 days | Exhausts quota after about 305 days          |
| Full copies with at most 14 daily + 8 weekly + 12 monthly points |                          1.11 GiB | Fits, before future data growth              |
| Format v3, no retention, no further unique-media growth          |                          1.05 GiB | Fits; database copies dominate future growth |
| Format v3 with 34 retained points, current unique media          |                           156 MiB | Fits with substantial margin                 |

The format-v3 estimates count two 31,515 KiB media replicas and 2,846 KiB of database plus metadata
per snapshot. They exclude filesystem overhead and future unique media. As a sensitivity check, the
observed 1,163 KiB media increase over four days would add roughly 207 MiB per year after the
two-replica factor if it continued linearly; four days is too short to treat that as a forecast.

The current no-retention policy crosses the issue's 12-month exhaustion threshold. The target
retention policy would also solve the immediate quota problem, but it is not implemented and
requires destructive garbage collection rules. Format v3 is selected now because it reduces the
stored data before retention, retains independently checked replicas, and can be introduced without
backward-compatibility cost at this early stage. Retention remains separate work in issue #41.

## Decision

Format v3 separates a logical recovery point from physical media storage:

- the encrypted logical manifest records every original blob name, plaintext SHA-256, plaintext
  size, and the content-addressed path `blobs/<plaintext-sha256>.age`;
- blobs with identical plaintext content share one path, including duplicates within one backup;
- a signed public storage manifest lists only content hashes, sizes, encrypted transfer checksums,
  and fixed artifact paths; it never exposes original blob names or database plaintext checksums;
- `.complete` format v3 authenticates both signed manifests and is still uploaded last;
- the MyDevil archiver verifies both signatures, all declared transfer checksums and sizes, exact
  object counts, and fixed paths before accepting the backup;
- accepted media is stored under
  `repository-v3/objects/sha256/<first-two-hex>/<plaintext-sha256>/` with two separately allocated
  files, `replica-1.age` and `replica-2.age`, plus ciphertext checksum sidecars;
- snapshot media paths are hard links to a healthy object replica. Database and signed metadata
  remain snapshot-specific;
- a later randomized `age` ciphertext replaces replica 2 when both initial replicas still contain
  the same ciphertext. This provides cryptographically independent copies without retaining every
  uploaded ciphertext;
- the full validator decrypts every referenced object and checks its plaintext SHA-256 and size.
  The public storage manifest authenticates ingestion; the encrypted logical manifest remains the
  authority for recovery.

There is no mutable global index. The object pool can be reconstructed from signed snapshot
manifests, and snapshot deletion does not automatically garbage-collect objects.

## Production measurements and Azure recovery evidence

On 2026-11-13, the MyDevil repository checker passed for 21 format-v3 snapshots and 39 unique
media objects. Their manifests contained 676 media references. The encrypted media would have
occupied about 469 MiB in independent copies, versus about 93 MiB in the shared pool including
both replicas. That is about 80% less media storage. The entire v3 repository occupied about
156 MiB on disk, including independent database dumps and metadata.

On 2026-11-17, an isolated Azure drill restored `production-20261112T165620Z` into temporary
PostgreSQL and Blob Storage resources. It recovered 33 blobs and 63 migration records, with 398
public tables and zero sessions. The image recorded in the backup (`95c6a8e`) returned HTTP 500
on the homepage because it expected a column that had already been removed from the captured schema.
With the newer image (`5f8d3a7`) and eight additional migrations applied to the temporary database,
the homepage, admin and both health endpoints returned HTTP 200. JPEG and PDF range reads through
the application returned HTTP 206 with the requested 32 bytes. The temporary resource group was
deleted after the logs were collected.

This drill verified recovery from a deduplicated backup by upgrading the restored data. Exact
historical restore, including image/schema compatibility checks at backup creation, rescue
classification and rejection of such copies by exact-restore preflight, is tracked in
[#53](https://github.com/wkf-pl/wkf.wroclaw.pl/issues/53). Automated retention is tracked in
[#41](https://github.com/wkf-pl/wkf.wroclaw.pl/issues/41).

## Cost and operational effort

The design adds no software licence or persistent compute service. Incremental cash cost is zero
while the deduplicated repository fits the existing MyDevil quota. The contingency observed on
2026-10-24 was an additional 10 GB for 12.50 PLN gross per month (150 PLN gross per year); verify the
current offer before buying capacity. A temporary Azure restore drill still incurs its normal
short-lived consumption cost.

Engineering and operator time is tracked separately from cash cost. It includes implementation,
two initial backup runs, local validation, the isolated Azure drill, periodic repository checks,
and deliberate object garbage collection when a retention policy is introduced.

## Consequences

Media growth is proportional to unique content with a fixed two-replica overhead, while databases
and metadata still grow per snapshot. A corrupt single replica is locally repairable. The main
tradeoff is greater archiver complexity and the need for explicit garbage collection; deleting a
snapshot alone must never delete shared objects.

See the [operations runbook](../Operations.md) for repository checks, repair and restore procedures.
