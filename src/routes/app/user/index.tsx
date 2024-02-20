import { routeLoader$ } from "@builder.io/qwik-city";
import { Error } from "~/components/error";
import { graphqlLoader } from "~/utils/graphql";
import { graphql } from "~/__generated__";
import { component$ } from "@builder.io/qwik";

export const useGqlDetails = routeLoader$(
  graphqlLoader(
    graphql(`
      query Details {
        user {
          name
          nickname
          email
          emailVerified
        }
        entities {
          fen
          company
          executiveName
          legalType
          name
          displayName
          activeState
          statuses {
            name
            value
          }
          accounts {
            fan
            displayName
          }
          contacts {
            __typename
            shortName
            beneficialOwner
            status
            ... on PersonContact {
              personTitle
              personFirstName
              personInits
              personFamilyName
              personBirthdate
            }
            ... on OrganisationContact {
              organisationName
            }
            contactMethods {
              __typename
              contactType
              detail
              sortSeq
            }
          }
        }
      }
    `),
    {},
  ),
);

export default component$(() => {
  const details = useGqlDetails();
  if (!details.value.success) {
    return <Error />;
  }
  return <></>;
});
