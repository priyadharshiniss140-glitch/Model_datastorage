# Vote endpoint test results

The automated HTTP integration test sends requests to the Express app through Supertest and verifies:
- `POST /posts/1/vote` -> 201; score increments from 0 to 1.
- Repeat `POST /posts/1/vote` -> 409; score stays at 1.
- `POST /posts/999999/vote` -> 404.
- `POST /posts/abc/vote` -> 400.

See the linked GitHub Actions run in the pull request for the actual job log. This is an automated HTTP test report, not a screenshot from the Thunder Client UI.
