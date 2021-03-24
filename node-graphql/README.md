# Create Mongo Backup

```
mongodump --out /data_con/ -u <user> --authenticationDatabase mcs -p <password>
tar -zcvf mongo_backup.tar.gz data_con/
docker cp mcs-mongo:/mongo_backup.tar.gz <local_filename_here>
```

Now move your backup file to where you need it for the restore


# Restore Mongo Backup

```
gunzip -c <mongo_backup_file> | tar xopf -
docker stop mcs-mongo
docker rm mcs-mongo
```

(Open the docker preferences and modify the swap parameter to have at least 3GB of swap memory)

```
docker-compose up -d 
docker cp data_con/ mcs-mongo:/mcs_backup_restore
docker exec -it mcs-mongo bash
mongorestore -u <user> --authenticationDatabase mcs -p <password> -d mcs ./mcs_backup_restore/mcs
```

# Sample CSV Export command
```
mongoexport -u <user> --authenticationDatabase mcs -p <password> -c mcs_history --type=csv --out=history.csv --fieldFile=historyFields.txt -d mcs --query='{"eval": "Evaluation 3 Results"}'
```
