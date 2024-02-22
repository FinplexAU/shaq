import {
  Form,
  routeAction$,
  routeLoader$,
  useNavigate,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { Error } from "~/components/error";
import { graphql, graphqlAction, graphqlLoader } from "~/utils/graphql";
import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/button";
import { Spinner } from "~/components/spinner";
import { useLogOut, useUser } from "../layout";
import type { ResultOf } from "gql.tada";

const gqlQuery = graphql(`
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
`);

export const useGqlDetails = routeLoader$(graphqlLoader(gqlQuery, {}));

export const useRequestEmailVerificationFormAction = routeAction$(
  graphqlAction(
    graphql(`
      mutation RequestEmailVerification {
        requestVerificationEmail
      }
    `),
  ),
  zod$({}),
);

export const useUpdateProfileFormAction = routeAction$(
  graphqlAction(
    graphql(`
      mutation UpdateProfile($nickname: String!) {
        updateProfile(nickname: $nickname) {
          name
          nickname
        }
      }
    `),
  ),
  zod$({
    nickname: z.string(),
  }),
);

export default component$(() => {
  const details = useGqlDetails();
  const verifyEmail = useRequestEmailVerificationFormAction();
  const updateProfile = useUpdateProfileFormAction();
  const user = useUser();
  const logOut = useLogOut();
  const nav = useNavigate();
  if (details.value.failed == true) {
    return <Error />;
  }
  return (
    <div class="flex flex-1 flex-col gap-8 pt-4">
      <div class="flex  justify-between">
        <h1 class="text-4xl font-bold">Account Details</h1>
        <Form
          action={logOut}
          onSubmitCompleted$={(x) => {
            const url = x.detail.value.toString();
            nav(url);
          }}
        >
          <Button class="text-sm">Sign out</Button>
        </Form>
      </div>
      <section class="max-w-prose">
        <h2 class="pb-8 text-2xl font-semibold">Profile</h2>
        <div class="flex flex-col gap-2 pb-4">
          <label>Full Name</label>
          <input
            disabled
            class="rounded bg-stone-100 px-4 py-2"
            value={details.value.user?.name}
          ></input>
        </div>

        <Form action={updateProfile} class="relative flex flex-col gap-2 pb-4">
          <label>Nickname</label>
          <div class="flex gap-2">
            <input
              name="nickname"
              class="flex-1 rounded bg-stone-100 px-4 py-2"
              value={details.value.user?.nickname}
            ></input>
            <Button type="submit" disabled={updateProfile.isRunning}>
              {updateProfile.value?.success && <>Updated</>}
              {updateProfile.value?.success === undefined &&
                (updateProfile.isRunning ? (
                  <Spinner size="md"></Spinner>
                ) : (
                  <>Update</>
                ))}
            </Button>
          </div>
        </Form>
        <div class="flex flex-col gap-2 pb-4">
          <label>Email</label>
          <div class="flex gap-4 ">
            <input
              disabled
              class="flex-1 rounded bg-stone-100 px-4 py-2 "
              value={details.value.user?.email}
            ></input>
            {details.value.user &&
              details.value.user.emailVerified === true &&
              !verifyEmail.value?.success && (
                <Form action={verifyEmail}>
                  <Button type="submit" disabled={verifyEmail.isRunning}>
                    {verifyEmail.isRunning ? (
                      <Spinner size="md"></Spinner>
                    ) : (
                      <>Verify</>
                    )}
                  </Button>
                </Form>
              )}
            {verifyEmail.value?.success && <p>Verification email sent.</p>}
          </div>
        </div>
      </section>
      <section>
        <h2 class="pb-8 text-2xl font-semibold">Investor Entities</h2>
        <div class="grid gap-8">
          {details.value.entities.map((entity) => (
            <EntityCard key={entity.fen} entity={entity}></EntityCard>
          ))}
        </div>
      </section>
      <pre class="text-right text-xs text-black/20">{user.value.fin}</pre>
    </div>
  );
});

export const EntityCard = component$(
  (props: { entity: ResultOf<typeof gqlQuery>["entities"][number] }) => {
    const details = useGqlDetails();

    if (details.value.failed == true) {
      return <Error />;
    }
    return (
      <div class="border-b ring-stone-100 hover:bg-stone-100 hover:ring">
        <div class="relative border-b pb-2">
          <p class="font-light uppercase">{props.entity.legalType}</p>
          <p class="text-lg font-semibold">{props.entity.displayName}</p>
          {props.entity.activeState !== "Active" && (
            <p class="absolute right-0 top-0 font-light text-red-500">
              {props.entity.activeState}
            </p>
          )}
        </div>
        <div class="space-y-2 py-2">
          <div>
            <p class="text-sm font-light">Legal Name</p>
            <p>{props.entity.name}</p>
          </div>
          <div>
            <p class="text-sm font-light">Wholesale Certificate</p>
            <p>
              {
                props.entity.statuses.find(
                  (v) => v?.name === "WholesaleCertificate",
                )?.value
              }
            </p>
          </div>
          <div>
            <p class="text-sm font-light">Trading Accounts</p>
            <p>
              {props.entity.accounts
                .map((account) => account.displayName)
                .join(", ")}
            </p>
          </div>
        </div>
      </div>
    );
  },
);
