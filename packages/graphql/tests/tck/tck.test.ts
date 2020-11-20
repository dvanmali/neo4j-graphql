/* eslint-disable no-param-reassign */
import { graphql, printSchema, parse } from "graphql";
import { lexicographicSortSchema } from "graphql/utilities";
import { makeExecutableSchema } from "@graphql-tools/schema";
import path from "path";
import pluralize from "pluralize";
import { translate } from "../../src/translate";
import { makeAugmentedSchema } from "../../src";
import serialize from "../../src/utils/serialize";
import { noGraphQLErrors } from "../../../../scripts/tests/utils";
import { generateTestCasesFromMd, Test, TestCase } from "./utils/generate-test-cases-from-md.utils";
import { trimmer } from "../../src/utils";

const TCK_DIR = path.join(__dirname, "tck-test-files");

describe("TCK Generated tests", () => {
    const testCases: TestCase[] = generateTestCasesFromMd(TCK_DIR);

    testCases.forEach(({ schema, tests, file, kind }) => {
        describe(file, () => {
            if (kind === "cypher") {
                const document = parse(schema as string);
                const neoSchema = makeAugmentedSchema({ typeDefs: schema });

                test.each(tests.map((t) => [t.name, t as Test]))("%s", async (_, obj) => {
                    const test = obj as Test;

                    const graphQlQuery = test.graphQlQuery as string;
                    const graphQlParams = test.graphQlParams as any;
                    const cypherQuery = test.cypherQuery as string;
                    const cypherParams = test.cypherParams as any;

                    const compare = (context: any, resolveInfo: any) => {
                        const [cQuery, cQueryParams] = translate({ context, resolveInfo });
                        expect(trimmer(cQuery)).toEqual(trimmer(cypherQuery));
                        expect(serialize(cQueryParams)).toEqual(cypherParams);
                    };

                    const context = {};

                    const queries = document.definitions.reduce((res, def) => {
                        if (def.kind !== "ObjectTypeDefinition") {
                            return res;
                        }

                        return {
                            ...res,
                            [pluralize(def.name.value)]: (_root: any, _params: any, ctx: any, resolveInfo: any) => {
                                ctx.neoSchema = neoSchema;

                                compare(context, resolveInfo);

                                return [];
                            },
                        };
                    }, {});

                    const mutations = document.definitions.reduce((res, def) => {
                        if (def.kind !== "ObjectTypeDefinition") {
                            return res;
                        }

                        return {
                            ...res,
                            [`create${pluralize(def.name.value)}`]: (
                                _root: any,
                                _params: any,
                                ctx: any,
                                resolveInfo: any
                            ) => {
                                ctx.neoSchema = neoSchema;

                                compare(context, resolveInfo);

                                return [];
                            },
                            [`update${pluralize(def.name.value)}`]: (
                                _root: any,
                                _params: any,
                                ctx: any,
                                resolveInfo: any
                            ) => {
                                ctx.neoSchema = neoSchema;

                                compare(context, resolveInfo);

                                return [];
                            },
                            [`delete${pluralize(def.name.value)}`]: (
                                _root: any,
                                _params: any,
                                ctx: any,
                                resolveInfo: any
                            ) => {
                                ctx.neoSchema = neoSchema;

                                compare(context, resolveInfo);

                                return { nodesDeleted: 1, relationshipsDeleted: 1 };
                            },
                        };
                    }, {});

                    const resolvers = { Query: queries, Mutation: mutations };

                    const executableSchema = makeExecutableSchema({
                        typeDefs: printSchema(neoSchema.schema),
                        resolvers,
                    });

                    noGraphQLErrors(await graphql(executableSchema, graphQlQuery, null, context, graphQlParams));
                });
            }

            if (kind === "schema") {
                test.each(tests.map((t) => [t.name, t as Test]))("%s", (_, obj) => {
                    const test = obj as Test;

                    const typeDefs = test.typeDefs as string;
                    const neoSchema = makeAugmentedSchema({ typeDefs });

                    const schemaOutPut = test.schemaOutPut as string;
                    const resolvers = neoSchema.resolvers;
                    const outPutSchema = makeExecutableSchema({ typeDefs: schemaOutPut, resolvers });

                    expect(printSchema(lexicographicSortSchema(neoSchema.schema))).toEqual(
                        printSchema(lexicographicSortSchema(outPutSchema))
                    );
                });
            }
        });
    });
});
