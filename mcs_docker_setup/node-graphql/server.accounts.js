const { ApolloServer, makeExecutableSchema } = require('apollo-server');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-toolkit/schema-merging');
const { AccountsModule } = require('@accounts/graphql-api');
const { accountsServer } = require('./server.mongo');
const { mcsTypeDefs, mcsResolvers } = require('./server.schema');
const { GRAPHQL_PORT } = require('./config');

// Generate the accounts-js GraphQL module
const accountsGraphQL = AccountsModule.forRoot({ accountsServer });

// Merge our schema and the accounts-js schema
const schema = makeExecutableSchema({
    typeDefs: mergeTypeDefs([mcsTypeDefs, accountsGraphQL.typeDefs]),
    resolvers: mergeResolvers([accountsGraphQL.resolvers, mcsResolvers]),
    schemaDirectives: {
        ...accountsGraphQL.schemaDirectives,
    }
});

const server = new ApolloServer({ schema, context: accountsGraphQL.context});

// The `listen` method launches a web server
server.listen(GRAPHQL_PORT).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});