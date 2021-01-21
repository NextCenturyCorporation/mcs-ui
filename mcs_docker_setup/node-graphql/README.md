# Restore Mongo Backup

gunzip -c <mongo_backup_file> | tar xopf -
docker stop mcs-mongo
docker rm mcs-mongo
(Open the docker preferences and modify the swap parameter to have at least 3GB of swap memory)
docker-compose up -d 
docker cp mcs_backup/ mcs-mongo:/mcs_backup_restore
docker exec -it mcs-mongo bash
mongorestore -u mongomcs --authenticationDatabase mcs -p mongomcspassword -d mcs ./mcs_backup_restore/

# Sample CSV Export command
mongoexport -u <user> --authenticationDatabase mcs -p <password> -c mcs_history --type=csv --out=history.csv --fieldFile=historyFields.txt -d mcs --query='{"eval": "Evaluation 3 Results"}'