# Content

This module shares editorial field configuration, URL generation, publication rules, and public
frontend queries.

## Public routes

- `/[slug]` — published static pages
- `/blog` and `/blog/[slug]` — the list and details of published posts
- `/category/[category]` and `/tag/[tag]` — posts filtered by taxonomy

Public queries always use Payload access control and additionally restrict results to documents with
the `published` status.

## Admin access

- `create`, `read`, `update`, and `delete` permissions are configured in the `Roles` collection.
- Without `read` permission, a resource is hidden from the authenticated user.
- The `own` and `published` restrictions are also enforced through the API.
- Permissions from multiple roles are combined, and unrestricted access takes precedence.

The Payload admin panel hides action buttons according to the `create`, `update`, and `delete`
permissions returned by the same access rules that protect the API.
