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
)