# AfyaChain Security Specification

## Data Invariants
1. A PatientCase must have a `chwId` matching the authenticated user.
2. An EpidemicAlert can only be modified by users with the `AUTHORITY` role.
3. Users can only read Case records from their own district (or all if they are an Authority).
4. `createdAt` fields are immutable and must match server time.

## The "Dirty Dozen" Payloads

1. **Identity Theft:** Attempt to create a case with someone else's `chwId`.
2. **Role Escalation:** CHW attempting to change their role to `AUTHORITY` in their user profile.
3. **Ghost Case:** Creating a case without sub-district or village metadata.
4. **ID Poisoning:** Massive string as `patientAgeMonths` or `caseId`.
5. **PII Leak:** Unauthorized user attempting to read the `/users` collection.
6. **Alert Sabotage:** CHW attempting to resolve an `EpidemicAlert`.
7. **Future Case:** Sending a `createdAt` timestamp from the future.
8. **Malicious Diagnosis:** Updating a case diagnosis without changing the `updatedAt` field.
9. **Cross-District Snooping:** CHW from District A reading cases from District B.
10. **Shadow Fields:** Injection of `isVerified: true` into a patient case to skip authority review.
11. **Malnutrition Spoof:** Authority modifying CHW-submitted `photoUrl`.
12. **Anonymous Write:** Unauthenticated user attempting to submit symptoms.

## Test Runner (Logic Outline)
- Check `request.auth.uid` matches `incoming().chwId`.
- Verify `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'AUTHORITY'` for alert writes.
- Enforce `.size() < 128` on all IDs.
- Validate `patientAgeMonths` is between 0 and 216 (18 years).
