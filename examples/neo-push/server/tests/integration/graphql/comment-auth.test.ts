import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { IncomingMessage } from "http";
import { Socket } from "net";
import jsonwebtoken from "jsonwebtoken";
import gql from "graphql-tag";
import * as neo4j from "../neo4j";
import server from "../server";

describe("comment-auth", () => {
    let driver: Driver;

    beforeAll(async () => {
        process.env.JWT_SECRET = "supersecret";
        driver = await neo4j.connect();
    });

    afterAll(async () => {
        delete process.env.JWT_SECRET;
        await driver.close();
    });

    test("should throw error when user creating a comment related to another user", async () => {
        const session = driver.session();

        const userId = generate({
            charset: "alphabetic",
        });

        const commentId = generate({
            charset: "alphabetic",
        });

        const mutation = gql`
                mutation {
                    createComments(input: [{ id: "${commentId}", content: "test", author: { connect: { where: { id: "invalid" } } } }]) {
                        comments {
                            id
                        }
                    }
                }
    
            `;

        const token = jsonwebtoken.sign({ sub: userId }, process.env.JWT_SECRET);

        const socket = new Socket({ readable: true });
        const req = new IncomingMessage(socket);
        req.headers.authorization = `Bearer ${token}`;

        try {
            const apolloServer = await server({ req });

            const response = await apolloServer.mutate({
                mutation,
            });

            expect(response.errors[0].message).toEqual("Forbidden");
        } finally {
            await session.close();
        }
    });
});
