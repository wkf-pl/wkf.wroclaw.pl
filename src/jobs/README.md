# Payload jobs

This directory will contain domain jobs such as session reminders, promotion from a waiting list,
and scheduled content publication.

Database migrations and one-off infrastructure operations are not Payload jobs; in Azure, they
should run as Container Apps Jobs.
