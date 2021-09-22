db = db.getSiblingDB('mcs');
db.createUser(
    {
        user: "mongomcs",
        pwd: "mongomcspassword",
        roles: [
            {
                role: "readWrite",
                db: "mcs"
            }
        ]
    }
);
db.createCollection('users');

db = db.getSiblingDB('dev');
db.createUser(
    {
        user: "mongomcs",
        pwd: "mongomcspassword",
        roles: [
            {
                role: "readWrite",
                db: "dev"
            }
        ]
    }
);
db.createCollection('users');