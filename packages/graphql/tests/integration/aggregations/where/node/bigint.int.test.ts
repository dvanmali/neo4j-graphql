/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Driver } from "neo4j-driver";
import { graphql } from "graphql";
import { generate } from "randomstring";
import Neo4j from "../../../neo4j";
import { Neo4jGraphQL } from "../../../../../src/classes";

describe("aggregations-where-node-bigint", () => {
    let driver: Driver;
    let neo4j: Neo4j;

    const bigInt = "2147483647";

    beforeAll(async () => {
        neo4j = new Neo4j();
        driver = await neo4j.getDriver();
    });

    afterAll(async () => {
        await driver.close();
    });

    test("should return posts where a like BigInt is EQUAL to", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someBigInt: BigInt
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someBigInt: toInteger(${bigInt})})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someBigInt_EQUAL: ${bigInt} } } }) {
                        testString
                        likes {
                            testString
                            someBigInt
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: neo4j.getContextValuesWithBookmarks(session.lastBookmark()),
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someBigInt: bigInt }],
                },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should return posts where a like BigInt is GT than", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someBigInt: BigInt
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const someBigInt = `${bigInt}1`;
        const someBigIntGt = bigInt.substring(0, bigInt.length - 1);

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someBigInt: ${someBigInt}})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someBigInt_GT: ${someBigIntGt} } } }) {
                        testString
                        likes {
                            testString
                            someBigInt
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: neo4j.getContextValuesWithBookmarks(session.lastBookmark()),
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someBigInt }],
                },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should return posts where a like BigInt is GTE than", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someBigInt: BigInt
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someBigInt: toInteger(${bigInt})})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someBigInt_GTE: ${bigInt} } } }) {
                        testString
                        likes {
                            testString
                            someBigInt
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: neo4j.getContextValuesWithBookmarks(session.lastBookmark()),
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someBigInt: bigInt }],
                },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should return posts where a like BigInt is LT than", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someBigInt: BigInt
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const someBigIntLT = `${bigInt}1`;

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someBigInt: toInteger(${bigInt})})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someBigInt_LT: ${someBigIntLT} } } }) {
                        testString
                        likes {
                            testString
                            someBigInt
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: neo4j.getContextValuesWithBookmarks(session.lastBookmark()),
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someBigInt: bigInt }],
                },
            ]);
        } finally {
            await session.close();
        }
    });

    test("should return posts where a like BigInt is LTE than", async () => {
        const session = await neo4j.getSession();

        const typeDefs = `
            type User {
                testString: String!
                someBigInt: BigInt
            }

            type Post {
              testString: String!
              likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        const testString = generate({
            charset: "alphabetic",
            readable: true,
        });

        const neoSchema = new Neo4jGraphQL({ typeDefs });

        try {
            await session.run(
                `
                    CREATE (:Post {testString: "${testString}"})<-[:LIKES]-(:User {testString: "${testString}", someBigInt: toInteger(${bigInt})})
                    CREATE (:Post {testString: "${testString}"})
                `
            );

            const query = `
                {
                    posts(where: { testString: "${testString}", likesAggregate: { node: { someBigInt_LTE: ${bigInt} } } }) {
                        testString
                        likes {
                            testString
                            someBigInt
                        }
                    }
                }
            `;

            const gqlResult = await graphql({
                schema: await neoSchema.getSchema(),
                source: query,
                contextValue: neo4j.getContextValuesWithBookmarks(session.lastBookmark()),
            });

            if (gqlResult.errors) {
                console.log(JSON.stringify(gqlResult.errors, null, 2));
            }

            expect(gqlResult.errors).toBeUndefined();

            expect((gqlResult.data as any).posts).toEqual([
                {
                    testString,
                    likes: [{ testString, someBigInt: bigInt }],
                },
            ]);
        } finally {
            await session.close();
        }
    });
});
