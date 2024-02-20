/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
};

export type Account = {
  __typename?: 'Account';
  cashStatements: Array<Array<Maybe<CashStatement>>>;
  displayName?: Maybe<Scalars['String']['output']>;
  fan: Scalars['ID']['output'];
  fen: Scalars['ID']['output'];
  hasTradingAccess: Scalars['Boolean']['output'];
  holdings: Array<Holding>;
  payId?: Maybe<PayId>;
  performance?: Maybe<PerformanceSummary>;
  transactions?: Maybe<Array<Maybe<Transaction>>>;
};


export type AccountCashStatementsArgs = {
  filterCcy: Array<CurrencyCode>;
  fromDate?: InputMaybe<Scalars['Date']['input']>;
  toDate?: InputMaybe<Scalars['Date']['input']>;
};


export type AccountHoldingsArgs = {
  asAtDate: Scalars['Date']['input'];
  valCcy: CurrencyCode;
};


export type AccountPerformanceArgs = {
  fromDate?: InputMaybe<Scalars['Date']['input']>;
  toDate?: InputMaybe<Scalars['Date']['input']>;
  valCcy?: InputMaybe<CurrencyCode>;
};


export type AccountTransactionsArgs = {
  filterCcy?: InputMaybe<CurrencyCode>;
  fromDate?: InputMaybe<Scalars['Date']['input']>;
  toDate?: InputMaybe<Scalars['Date']['input']>;
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  countryName: Scalars['String']['output'];
  line1: Scalars['String']['output'];
  line2?: Maybe<Scalars['String']['output']>;
  line3?: Maybe<Scalars['String']['output']>;
  postcode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
};

export type AddressContactMethod = ContactMethod & {
  __typename?: 'AddressContactMethod';
  address: Address;
  contactType: ContactType;
  detail: Scalars['String']['output'];
  sortSeq: Scalars['Int']['output'];
};

export type Asset = {
  __typename?: 'Asset';
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type BsbInformation = {
  __typename?: 'BSBInformation';
  bankCode: Scalars['ID']['output'];
  branchName: Scalars['String']['output'];
  bsb: Scalars['ID']['output'];
  financialInstitution: Scalars['String']['output'];
};

export type CashStatement = {
  __typename?: 'CashStatement';
  assetName: Scalars['String']['output'];
  assetPurchasePrice?: Maybe<Scalars['Float']['output']>;
  assetSymbol: Scalars['String']['output'];
  cashBalance: Scalars['Float']['output'];
  currency: CurrencyCode;
  effectiveDate: Scalars['Date']['output'];
  exchangeCode?: Maybe<Scalars['String']['output']>;
  grossAmount: Scalars['Float']['output'];
  movementId: Scalars['ID']['output'];
  narrative: Scalars['String']['output'];
  netAssetCost?: Maybe<Scalars['Float']['output']>;
  totalGrossCashChange: Scalars['Float']['output'];
  totalNetAssetPurchasePrice?: Maybe<Scalars['Float']['output']>;
  totalNetCashChange: Scalars['Float']['output'];
  transactionType: Scalars['String']['output'];
};

export type Contact = {
  beneficialOwner: Scalars['Boolean']['output'];
  contactMethods?: Maybe<Array<Maybe<ContactMethod>>>;
  shortName: Scalars['String']['output'];
  status: ContactStatus;
};

export type ContactForm =
  | 'Organisation'
  | 'Person';

export type ContactMethod = {
  contactType: ContactType;
  detail: Scalars['String']['output'];
  sortSeq: Scalars['Int']['output'];
};

export type ContactStatus =
  | 'Active'
  | 'Deleted';

export type ContactType =
  | 'AddressBusiness'
  | 'AddressPostal'
  | 'AddressResidence'
  | 'AimTextChat'
  | 'EmailBusiness'
  | 'EmailPrivate'
  | 'FaxBiz'
  | 'FaxHome'
  | 'OtherMethod'
  | 'Pager'
  | 'PhoneAssistant'
  | 'PhoneBusiness'
  | 'PhoneCar'
  | 'PhoneHome'
  | 'PhoneMob'
  | 'SkypeTextChat'
  | 'SmsTextMessage'
  | 'WhatsAppTextChat';

export type CurrencyCode =
  | 'ARS'
  | 'AUD'
  | 'BRL'
  | 'BWP'
  | 'CAD'
  | 'CHF'
  | 'CNH'
  | 'CNY'
  | 'COP'
  | 'CZK'
  | 'DKK'
  | 'EGP'
  | 'EUR'
  | 'GBP'
  | 'HKD'
  | 'HUF'
  | 'IDR'
  | 'INR'
  | 'ISK'
  | 'JPY'
  | 'KRW'
  | 'KZT'
  | 'LTL'
  | 'LUF'
  | 'MXN'
  | 'MYR'
  | 'NOK'
  | 'NZD'
  | 'PEN'
  | 'PLN'
  | 'RON'
  | 'RUB'
  | 'SEK'
  | 'SGD'
  | 'SIT'
  | 'SKK'
  | 'THB'
  | 'TRY'
  | 'TWD'
  | 'USD'
  | 'UYU'
  | 'VND'
  | 'ZAR';

export type DirectDepositRecipient = {
  accountName: Scalars['String']['input'];
  accountNumber: Scalars['ID']['input'];
  bsb: Scalars['ID']['input'];
};

export type Document = {
  __typename?: 'Document';
  body: Array<DocumentBody>;
  id: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type DocumentBody = {
  __typename?: 'DocumentBody';
  key: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type Entity = {
  __typename?: 'Entity';
  accounts: Array<Account>;
  activeState: EntityActiveState;
  cashStatements?: Maybe<Array<Array<CashStatement>>>;
  company: Scalars['String']['output'];
  contacts: Array<Contact>;
  displayName: Scalars['String']['output'];
  executiveName: Scalars['String']['output'];
  fen: Scalars['ID']['output'];
  holdings: Array<Holding>;
  legalType: LegalType;
  name: Scalars['String']['output'];
  performance: PerformanceSummary;
  performanceChart: Array<PerformanceChartPoint>;
  statuses: Array<Maybe<EntityStatus>>;
  transactions: Array<Transaction>;
};


export type EntityCashStatementsArgs = {
  filterCcy: Array<CurrencyCode>;
  fromDate: Scalars['Date']['input'];
  toDate: Scalars['Date']['input'];
};


export type EntityHoldingsArgs = {
  asAtDate: Scalars['Date']['input'];
  valCcy: CurrencyCode;
};


export type EntityPerformanceArgs = {
  fromDate: Scalars['Date']['input'];
  toDate: Scalars['Date']['input'];
  valCcy: CurrencyCode;
};


export type EntityPerformanceChartArgs = {
  valCcy: CurrencyCode;
};


export type EntityTransactionsArgs = {
  filterCcy?: InputMaybe<CurrencyCode>;
  fromDate: Scalars['Date']['input'];
  toDate: Scalars['Date']['input'];
};

export type EntityActiveState =
  | 'Active'
  | 'Closed'
  | 'Pending'
  | 'Suspended';

export type EntityActiveStateFilter = {
  eq?: InputMaybe<EntityActiveState>;
  ne?: InputMaybe<EntityActiveState>;
};

export type EntityQueryFilter = {
  activeState?: InputMaybe<EntityActiveStateFilter>;
  statusFilter?: InputMaybe<Array<InputMaybe<EntityStatusFilter>>>;
};

export type EntityStatus = {
  __typename?: 'EntityStatus';
  name: EntityStatusName;
  value: Scalars['String']['output'];
};

export type EntityStatusFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  status: EntityStatusName;
};

export type EntityStatusName =
  | 'ActiveState'
  | 'InformationMemorandum'
  | 'WholesaleCertificate';

export type GenericContactMethod = ContactMethod & {
  __typename?: 'GenericContactMethod';
  contactType: ContactType;
  detail: Scalars['String']['output'];
  sortSeq: Scalars['Int']['output'];
};

export type Holding = {
  __typename?: 'Holding';
  account: Account;
  assetName: Scalars['String']['output'];
  assetSymbol: Scalars['String']['output'];
  assetType: Scalars['String']['output'];
  avgPurchasePrice: Scalars['Float']['output'];
  currency: CurrencyCode;
  entity: Entity;
  exchangeCode?: Maybe<Scalars['String']['output']>;
  holdingId: Scalars['ID']['output'];
  marketPrice: Scalars['Float']['output'];
  marketValue?: Maybe<Scalars['Float']['output']>;
  performance: HoldingPerformance;
  quantity: Scalars['Float']['output'];
  totalGainLossValue: Scalars['Float']['output'];
  totalMarketPrice: Scalars['Float']['output'];
  totalMarketValue: Scalars['Float']['output'];
  totalPurchasePrice: Scalars['Float']['output'];
  totalPurchaseValue: Scalars['Float']['output'];
};


export type HoldingPerformanceArgs = {
  fromDate: Scalars['Date']['input'];
  toDate: Scalars['Date']['input'];
  valCcy: CurrencyCode;
};

export type HoldingPerformance = {
  __typename?: 'HoldingPerformance';
  totalAccruedInterestValue: Scalars['Float']['output'];
  totalClosingValue: Scalars['Float']['output'];
  totalContributedValue: Scalars['Float']['output'];
  totalDividendValue: Scalars['Float']['output'];
  totalFinancingFeeValue: Scalars['Float']['output'];
  totalFxGainLossValue: Scalars['Float']['output'];
  totalIncomeValue: Scalars['Float']['output'];
  totalInterestValue: Scalars['Float']['output'];
  totalNetTradingValue: Scalars['Float']['output'];
  totalOpeningValue: Scalars['Float']['output'];
  totalOtherValue: Scalars['Float']['output'];
  totalRealisedValue: Scalars['Float']['output'];
  totalReturnValue: Scalars['Float']['output'];
  totalUnrealisedValue: Scalars['Float']['output'];
  totalUnreconciledValue?: Maybe<Scalars['Float']['output']>;
  totalWithdrawnValue: Scalars['Float']['output'];
};

export type IdentityVerificationStatus =
  | 'Failed'
  | 'Pending'
  | 'PendingManualReview'
  | 'Successful';

export type InformationMemorandumResponse = {
  __typename?: 'InformationMemorandumResponse';
  success: InformationMemorandumResult;
};

export type InformationMemorandumResult =
  | 'Failure'
  | 'Partial'
  | 'Success';

export type LegalType =
  | 'Company'
  | 'Individual'
  | 'Joint'
  | 'SMSF'
  | 'Trust';

export type M2AssetGroup = {
  __typename?: 'M2AssetGroup';
  m2id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  shortName: Scalars['String']['output'];
};

export type MarketToken = {
  __typename?: 'MarketToken';
  access_token: Scalars['String']['output'];
  expires_in: Scalars['Int']['output'];
  scope: Scalars['String']['output'];
  token_type: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptInformationMemorandum: InformationMemorandumResponse;
  addPayIds: Array<PayId>;
  createAccounts: Array<Scalars['ID']['output']>;
  createCashTransfer: TransactionResponse;
  createEntity: Scalars['ID']['output'];
  createWithdraw: TransactionResponse;
  documentUrl: Document;
  generateNewPayIds: Array<PayId>;
  identityVerification: User;
  renameAccount: Scalars['Boolean']['output'];
  requestVerificationEmail: Scalars['Boolean']['output'];
  submitWholesaleCertificate: Scalars['Boolean']['output'];
  undoPayIds: Array<PayId>;
  updateProfile: User;
};


export type MutationAcceptInformationMemorandumArgs = {
  fen: Scalars['ID']['input'];
  requestsEmail: Scalars['Boolean']['input'];
};


export type MutationAddPayIdsArgs = {
  input: Array<PayIdInput>;
};


export type MutationCreateAccountsArgs = {
  accounts: Array<Scalars['String']['input']>;
  fen: Scalars['ID']['input'];
};


export type MutationCreateCashTransferArgs = {
  amount: Scalars['Float']['input'];
  currency: CurrencyCode;
  description?: InputMaybe<Scalars['String']['input']>;
  fromFan: Scalars['ID']['input'];
  toFan: Scalars['ID']['input'];
};


export type MutationCreateEntityArgs = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  legalName: Scalars['String']['input'];
  legalType: LegalType;
};


export type MutationCreateWithdrawArgs = {
  amount: Scalars['Float']['input'];
  currency: CurrencyCode;
  description?: InputMaybe<Scalars['String']['input']>;
  fan: Scalars['ID']['input'];
  recipient: WithdrawRecipient;
};


export type MutationDocumentUrlArgs = {
  mimeType: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};


export type MutationGenerateNewPayIdsArgs = {
  amount: Scalars['Int']['input'];
};


export type MutationIdentityVerificationArgs = {
  digitalIdCode: Scalars['String']['input'];
};


export type MutationRenameAccountArgs = {
  displayName: Scalars['String']['input'];
  fan: Scalars['String']['input'];
};


export type MutationSubmitWholesaleCertificateArgs = {
  documentId: Scalars['String']['input'];
  fen: Scalars['String']['input'];
};


export type MutationUndoPayIdsArgs = {
  input: Array<PayIdInput>;
};


export type MutationUpdateProfileArgs = {
  nickname?: InputMaybe<Scalars['String']['input']>;
};

export type OrganisationContact = Contact & {
  __typename?: 'OrganisationContact';
  beneficialOwner: Scalars['Boolean']['output'];
  contactMethods?: Maybe<Array<Maybe<ContactMethod>>>;
  organisationName: Scalars['String']['output'];
  shortName: Scalars['String']['output'];
  status: ContactStatus;
};

export type PayId = {
  __typename?: 'PayId';
  words: Array<Scalars['String']['output']>;
};

export type PayIdInput = {
  words: Array<Scalars['String']['input']>;
};

export type PerformanceChartPoint = {
  __typename?: 'PerformanceChartPoint';
  fromDate: Scalars['Date']['output'];
  month: Scalars['String']['output'];
  returnTotalForPeriodPercentage: Scalars['Float']['output'];
  returnTotalForPeriodValue: Scalars['Float']['output'];
  toDate: Scalars['Date']['output'];
};

export type PerformanceSummary = {
  __typename?: 'PerformanceSummary';
  closingDate: Scalars['Date']['output'];
  openingDate: Scalars['Date']['output'];
  totalAccruedInterestValue: Scalars['Float']['output'];
  totalAnnualisedPerformanceValue: Scalars['Float']['output'];
  totalAnnualisedTwrPerformanceValue: Scalars['Float']['output'];
  totalClosingValue: Scalars['Float']['output'];
  totalContributedValue: Scalars['Float']['output'];
  totalDividendValue: Scalars['Float']['output'];
  totalFinancingFeeValue: Scalars['Float']['output'];
  totalFxGainLossValue: Scalars['Float']['output'];
  totalIncomeTakenDirectlyValue: Scalars['Float']['output'];
  totalInterestValue: Scalars['Float']['output'];
  totalNetCapitalFlowsValue: Scalars['Float']['output'];
  totalOpeningValue: Scalars['Float']['output'];
  totalRealisedValue: Scalars['Float']['output'];
  totalReturnValue: Scalars['Float']['output'];
  totalUnrealisedValue: Scalars['Float']['output'];
  totalWithdrawnValue: Scalars['Float']['output'];
};

export type PersonContact = Contact & {
  __typename?: 'PersonContact';
  beneficialOwner: Scalars['Boolean']['output'];
  contactMethods?: Maybe<Array<Maybe<ContactMethod>>>;
  personBirthdate?: Maybe<Scalars['Date']['output']>;
  personFamilyName: Scalars['String']['output'];
  personFirstName: Scalars['String']['output'];
  personInits?: Maybe<Scalars['String']['output']>;
  personTitle?: Maybe<Scalars['String']['output']>;
  shortName: Scalars['String']['output'];
  status: ContactStatus;
};

export type PublicDocument = {
  __typename?: 'PublicDocument';
  title: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  accounts: Array<Account>;
  bsbLookup: BsbInformation;
  entities: Array<Entity>;
  symbols: Array<Maybe<SymbolInformation>>;
  user?: Maybe<User>;
};


export type QueryAccountsArgs = {
  fans?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type QueryBsbLookupArgs = {
  bsb: Scalars['ID']['input'];
};


export type QueryEntitiesArgs = {
  fens?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  filter?: InputMaybe<EntityQueryFilter>;
};


export type QuerySymbolsArgs = {
  codes: Array<Scalars['String']['input']>;
};

export type SymbolInformation = {
  __typename?: 'SymbolInformation';
  bannerImageUrl?: Maybe<Scalars['String']['output']>;
  blurb?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  documents: Array<PublicDocument>;
  nav?: Maybe<Scalars['Float']['output']>;
  symbolStatus?: Maybe<SymbolStatus>;
};

export type SymbolStatus =
  | 'Halted'
  | 'Open'
  | 'PreListed';

export type Transaction = {
  __typename?: 'Transaction';
  account: Account;
  assetName: Scalars['String']['output'];
  assetPurchasePrice?: Maybe<Scalars['Float']['output']>;
  assetSymbol: Scalars['String']['output'];
  currency: CurrencyCode;
  effectiveDate: Scalars['Date']['output'];
  entity: Entity;
  exchangeCode?: Maybe<Scalars['String']['output']>;
  movementId: Scalars['ID']['output'];
  narrative: Scalars['String']['output'];
  quantity?: Maybe<Scalars['Float']['output']>;
  totalGrossCashChange: Scalars['Float']['output'];
  totalNetAssetPurchasePrice?: Maybe<Scalars['Float']['output']>;
  totalNetCashChange: Scalars['Float']['output'];
  transactionType: Scalars['String']['output'];
};

export type TransactionResponse = {
  __typename?: 'TransactionResponse';
  reference: Scalars['ID']['output'];
  success: Scalars['Boolean']['output'];
};

export type User = {
  __typename?: 'User';
  birthdate?: Maybe<Scalars['Date']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerified?: Maybe<Scalars['Boolean']['output']>;
  familyName?: Maybe<Scalars['String']['output']>;
  givenName?: Maybe<Scalars['String']['output']>;
  marketToken?: Maybe<MarketToken>;
  name: Scalars['String']['output'];
  nickname?: Maybe<Scalars['String']['output']>;
  statuses: UserStatuses;
};

export type UserStatuses = {
  __typename?: 'UserStatuses';
  identityVerification?: Maybe<IdentityVerificationStatus>;
};

export type WithdrawRecipient = {
  DirectDeposit?: InputMaybe<DirectDepositRecipient>;
};

export type DetailsQueryVariables = Exact<{ [key: string]: never; }>;


export type DetailsQuery = { __typename?: 'Query', user?: { __typename?: 'User', name: string, nickname?: string | null, email?: string | null, emailVerified?: boolean | null } | null, entities: Array<{ __typename?: 'Entity', fen: string, company: string, executiveName: string, legalType: LegalType, name: string, displayName: string, activeState: EntityActiveState, statuses: Array<{ __typename?: 'EntityStatus', name: EntityStatusName, value: string } | null>, accounts: Array<{ __typename?: 'Account', fan: string, displayName?: string | null }>, contacts: Array<{ __typename: 'OrganisationContact', organisationName: string, shortName: string, beneficialOwner: boolean, status: ContactStatus, contactMethods?: Array<{ __typename: 'AddressContactMethod', contactType: ContactType, detail: string, sortSeq: number } | { __typename: 'GenericContactMethod', contactType: ContactType, detail: string, sortSeq: number } | null> | null } | { __typename: 'PersonContact', personTitle?: string | null, personFirstName: string, personInits?: string | null, personFamilyName: string, personBirthdate?: any | null, shortName: string, beneficialOwner: boolean, status: ContactStatus, contactMethods?: Array<{ __typename: 'AddressContactMethod', contactType: ContactType, detail: string, sortSeq: number } | { __typename: 'GenericContactMethod', contactType: ContactType, detail: string, sortSeq: number } | null> | null }> }> };

export type RequestEmailVerificationMutationVariables = Exact<{ [key: string]: never; }>;


export type RequestEmailVerificationMutation = { __typename?: 'Mutation', requestVerificationEmail: boolean };

export type UpdateProfileMutationVariables = Exact<{
  nickname: Scalars['String']['input'];
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', name: string, nickname?: string | null } };


export const DetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Details"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}}]}},{"kind":"Field","name":{"kind":"Name","value":"entities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fen"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"executiveName"}},{"kind":"Field","name":{"kind":"Name","value":"legalType"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"activeState"}},{"kind":"Field","name":{"kind":"Name","value":"statuses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fan"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"contacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"shortName"}},{"kind":"Field","name":{"kind":"Name","value":"beneficialOwner"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PersonContact"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"personTitle"}},{"kind":"Field","name":{"kind":"Name","value":"personFirstName"}},{"kind":"Field","name":{"kind":"Name","value":"personInits"}},{"kind":"Field","name":{"kind":"Name","value":"personFamilyName"}},{"kind":"Field","name":{"kind":"Name","value":"personBirthdate"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrganisationContact"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organisationName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"contactMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"contactType"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"sortSeq"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DetailsQuery, DetailsQueryVariables>;
export const RequestEmailVerificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestEmailVerification"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestVerificationEmail"}}]}}]} as unknown as DocumentNode<RequestEmailVerificationMutation, RequestEmailVerificationMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"nickname"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"nickname"},"value":{"kind":"Variable","name":{"kind":"Name","value":"nickname"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;