/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n      query Details {\n        user {\n          name\n          nickname\n          email\n          emailVerified\n        }\n        entities {\n          fen\n          company\n          executiveName\n          legalType\n          name\n          displayName\n          activeState\n          statuses {\n            name\n            value\n          }\n          accounts {\n            fan\n            displayName\n          }\n          contacts {\n            __typename\n            shortName\n            beneficialOwner\n            status\n            ... on PersonContact {\n              personTitle\n              personFirstName\n              personInits\n              personFamilyName\n              personBirthdate\n            }\n            ... on OrganisationContact {\n              organisationName\n            }\n            contactMethods {\n              __typename\n              contactType\n              detail\n              sortSeq\n            }\n          }\n        }\n      }\n    ": types.DetailsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      query Details {\n        user {\n          name\n          nickname\n          email\n          emailVerified\n        }\n        entities {\n          fen\n          company\n          executiveName\n          legalType\n          name\n          displayName\n          activeState\n          statuses {\n            name\n            value\n          }\n          accounts {\n            fan\n            displayName\n          }\n          contacts {\n            __typename\n            shortName\n            beneficialOwner\n            status\n            ... on PersonContact {\n              personTitle\n              personFirstName\n              personInits\n              personFamilyName\n              personBirthdate\n            }\n            ... on OrganisationContact {\n              organisationName\n            }\n            contactMethods {\n              __typename\n              contactType\n              detail\n              sortSeq\n            }\n          }\n        }\n      }\n    "): (typeof documents)["\n      query Details {\n        user {\n          name\n          nickname\n          email\n          emailVerified\n        }\n        entities {\n          fen\n          company\n          executiveName\n          legalType\n          name\n          displayName\n          activeState\n          statuses {\n            name\n            value\n          }\n          accounts {\n            fan\n            displayName\n          }\n          contacts {\n            __typename\n            shortName\n            beneficialOwner\n            status\n            ... on PersonContact {\n              personTitle\n              personFirstName\n              personInits\n              personFamilyName\n              personBirthdate\n            }\n            ... on OrganisationContact {\n              organisationName\n            }\n            contactMethods {\n              __typename\n              contactType\n              detail\n              sortSeq\n            }\n          }\n        }\n      }\n    "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;