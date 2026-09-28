# Collections

Active collections:

- system and access: `Users`, `Roles`
- pages and editorial content: `Pages`, `Posts`, `Categories`, `Tags`
- events: `Events`, `EventCycles`, `EventTypes`
- people and organizations: `MemberProfiles`, `Partners`, `ClubSections`
- files: `Media`, `MemberProfileImages`, `Documents`, `DocumentFiles`
- internal public-query projection: `ContentListingItems`

Collections should contain schemas, access control, and thin hooks. Business-process logic belongs
in `src/modules/`.
