# ADR 0002: Privacy-preserving visit statistics

- **Status:** Proposed
- **Date:** 2026-09-12

## Context

WKF may eventually need aggregate information about visit counts and interest in individual pieces
of content. Its only purposes would be technical service optimization and better alignment of
published material, without advertising, data sales, identifying particular people, or tracking
them across sites.

The new application does not currently collect these statistics. Configuring Matomo without
cookies does not by itself make measurement privacy-neutral: the script can still read information
from a device and transmit data to the statistics server.

## Proposed direction

If the Club decides to introduce Matomo or a comparable tool:

1. Statistics will receive a separate consent category that is disabled by default.
2. The stored-preference version will increase so every user makes a new choice.
3. No statistics script, pixel, or endpoint will be called before consent, including in a
   cookieless configuration.
4. A Club-managed solution with data stored in the EEA will be preferred.
5. User ID, fingerprinting, cross-domain tracking, linking activity to CMS accounts, session
   recordings, heat maps, advertising, and marketing features will remain disabled.
6. IP addresses will be anonymized before storage, and precise geolocation will be disabled.
7. URLs, page titles, parameters, referrers, and events will be filtered to prevent personal data
   from being recorded.
8. Short raw-data retention periods and a justified aggregate-report retention period will be
   defined before launch.
9. Reports will be available only to authorized people, and Do Not Track will be respected as an
   additional safeguard.
10. The privacy policy will be updated before measurement begins.

## Acceptance conditions for a future implementation

- No decision, refusal, or consent only to map features causes any request to the statistics system.
- Withdrawing consent stops further measurement without requiring a page refresh.
- Submitted addresses and events contain no email addresses, user names, tokens, form data, or
  account identifiers.
- Reports cannot reconstruct the history of a particular visitor.
- Automatic deletion after the defined period has been verified with test data.
- The actual configuration, vendor agreements, data location, and legal basis have passed technical
  and legal review.

## Consequences

This approach will limit report detail and may reduce the number of recorded visits. That is a
deliberate cost of prioritizing privacy over statistical completeness. Implementation requires a
separate decision and does not follow automatically from accepting this ADR.

## Sources to verify again before implementation

- [Matomo: tracking without cookies](https://matomo.org/faq/general/faq_157/)
- [Matomo: privacy settings](https://matomo.org/faq/general/configure-privacy-settings-in-matomo/)
- [EDPB: technical scope of Article 5(3) of the ePrivacy Directive](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf)
- [Polish Electronic Communications Law](https://eli.gov.pl/api/acts/DU/2024/1221/text.html)
