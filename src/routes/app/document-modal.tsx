import type { QRL, Signal } from "@builder.io/qwik";
import { $, component$, useComputed$ } from "@builder.io/qwik";
import { useSetApproved, type DataDocument } from ".";
import {
  HiDocumentArrowDownSolid,
  HiDocumentSolid,
} from "@qwikest/icons/heroicons";
import Status from "~/components/status";
import { Button } from "~/components/button";
import { Form, useLocation } from "@builder.io/qwik-city";

export type DocumentModalInfo = {
  financier: string;
  trader: string;
  shipmentId: string;
  status: string;
  document: DataDocument;
};

const getFileDownloadUrl = (loc: URL, fileUrl: string) => {
  const url = new URL("/prx", loc);
  url.searchParams.set("url", fileUrl);
  return url.toString();
};

export default component$<{
  document: Signal<DocumentModalInfo | undefined>;
  fans: string[];
}>((props) => {
  const loc = useLocation();

  const close = $(() => {
    props.document.value = undefined;
  });

  const approvedByTrader = useComputed$<Date | null>(
    () => props.document.value?.document.approvedByTrader ?? null,
  );

  const approvedByFinancier = useComputed$<Date | null>(
    () => props.document.value?.document.approvedByFinancier ?? null,
  );

  return (
    <>
      {props.document.value && (
        <div
          tabIndex={-1}
          class="fixed inset-0 z-50 max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden bg-black/60"
          role="modal"
          aria-modal={true}
        >
          <div
            class="grid h-full w-full place-items-center"
            onClick$={(el, modalEl) => {
              const target = el.target as HTMLElement;
              if (target === modalEl) {
                close();
              }
            }}
          >
            <div class="max-h-full w-full max-w-md p-4">
              <div class="relative rounded-lg bg-white shadow dark:bg-gray-700">
                <button
                  type="button"
                  class="absolute end-2.5 top-3 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick$={close}
                >
                  <svg
                    class="h-3 w-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span class="sr-only">Close modal</span>
                </button>
                <div class="p-4 text-center text-gray-500 md:p-5">
                  <HiDocumentSolid class="mx-auto mb-4 text-5xl text-gray-400" />
                  <h3 class="mb-3 text-lg font-normal">
                    {props.document.value.document.title}
                  </h3>
                  <a
                    href={getFileDownloadUrl(
                      loc.url,
                      props.document.value.document.url,
                    )}
                    target="_blank"
                    download={props.document.value.document.title?.replaceAll(
                      " ",
                      "-",
                    )}
                  >
                    <Button class="mb-4">
                      <HiDocumentArrowDownSolid class="inline align-icon" />{" "}
                      Download
                    </Button>
                  </a>
                  <h4 class="mb-2 text-lg">Approval</h4>
                  <div class="pb-1">
                    <Status
                      color={approvedByTrader.value ? "green" : "red"}
                      class="mr-2"
                    />
                    <span class="mr-2">Trader:</span>
                    {approvedByTrader.value && (
                      <span>
                        {approvedByTrader.value.toLocaleDateString([], {
                          dateStyle: "short",
                        })}
                      </span>
                    )}
                    {!approvedByTrader.value &&
                      (props.fans.includes(props.document.value.trader) ? (
                        <ApproveButton
                          document={props.document.value}
                          closeFn={close}
                        />
                      ) : (
                        <span>Not yet approved</span>
                      ))}
                  </div>
                  <div class="pb-1">
                    <Status
                      color={approvedByFinancier.value ? "green" : "red"}
                      class="mr-2"
                    />
                    <span class="mr-2">Financier:</span>
                    {approvedByFinancier.value && (
                      <span>
                        {approvedByFinancier.value.toLocaleDateString([], {
                          dateStyle: "short",
                        })}
                      </span>
                    )}
                    {!approvedByFinancier.value &&
                      (props.fans.includes(props.document.value.financier) ? (
                        <ApproveButton
                          document={props.document.value}
                          closeFn={close}
                        />
                      ) : (
                        <span>Not yet approved</span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export const ApproveButton = component$<{
  document: DocumentModalInfo;
  closeFn: QRL<() => void>;
}>((props) => {
  const approveAction = useSetApproved();

  return (
    <Form
      action={approveAction}
      class="inline"
      onSubmitCompleted$={props.closeFn}
    >
      <input name="shipmentId" value={props.document.shipmentId} hidden />
      <input name="status" value={props.document.status} hidden />
      <input name="documentId" value={props.document.document.id} hidden />
      <Button class="p-2 text-sm">Approve</Button>
    </Form>
  );
});
