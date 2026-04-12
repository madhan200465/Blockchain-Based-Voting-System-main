# Postman API Testing - Blockchain Based Voting System

## Files

- BBVS-API.postman_collection.json
- BBVS-Local.postman_environment.json

## Import Steps

1. Open Postman.
2. Import the collection file and the environment file from this folder.
3. Select the BBVS Local environment.
4. Ensure backend is running on http://localhost:8000.
5. Update adminEmail and adminPassword in the environment if your local seed credentials differ.

## Recommended Test Order

1. Health > Ping
2. Auth > Admin Login (sets accessToken)
3. User Onboarding Flow > Signup New Voter (creates a pending user)
4. User Onboarding Flow > Admin List Pending Users
5. User Onboarding Flow > Admin Verify Pending User (sets assignedVoterId)
6. Voter Flow > Login Verified Voter by Voter ID
7. Voter Flow > Check Voteability
8. Admin Poll Flow > Start Election
9. Voter Flow > Cast Vote
10. Admin Poll Flow > End Election
11. Admin Poll Flow > Publish Results
12. Results > Public Poll Snapshot

## Notes

- Collection test scripts automatically capture tokens and key IDs into environment variables.
- Vote endpoint now expects an alphanumeric Voter ID (6-24 chars), for example VOT000123.
- If a request fails due to election status (already started/finished), run reset and re-run the flow.
