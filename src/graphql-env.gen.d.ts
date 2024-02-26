/* eslint-disable */
/* prettier-ignore */

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  "__schema": {
    "queryType": {
      "name": "Query"
    },
    "mutationType": {
      "name": "Mutation"
    },
    "subscriptionType": null,
    "types": [
      {
        "kind": "SCALAR",
        "name": "Date"
      },
      {
        "kind": "ENUM",
        "name": "CurrencyCode",
        "enumValues": [
          {
            "name": "ARS"
          },
          {
            "name": "AUD"
          },
          {
            "name": "BWP"
          },
          {
            "name": "BRL"
          },
          {
            "name": "CAD"
          },
          {
            "name": "CNH"
          },
          {
            "name": "CNY"
          },
          {
            "name": "COP"
          },
          {
            "name": "CZK"
          },
          {
            "name": "DKK"
          },
          {
            "name": "EGP"
          },
          {
            "name": "EUR"
          },
          {
            "name": "GBP"
          },
          {
            "name": "HKD"
          },
          {
            "name": "HUF"
          },
          {
            "name": "IDR"
          },
          {
            "name": "INR"
          },
          {
            "name": "ISK"
          },
          {
            "name": "JPY"
          },
          {
            "name": "KZT"
          },
          {
            "name": "LTL"
          },
          {
            "name": "LUF"
          },
          {
            "name": "MXN"
          },
          {
            "name": "MYR"
          },
          {
            "name": "TWD"
          },
          {
            "name": "NZD"
          },
          {
            "name": "NOK"
          },
          {
            "name": "PEN"
          },
          {
            "name": "PLN"
          },
          {
            "name": "KRW"
          },
          {
            "name": "RON"
          },
          {
            "name": "RUB"
          },
          {
            "name": "SGD"
          },
          {
            "name": "SKK"
          },
          {
            "name": "SIT"
          },
          {
            "name": "ZAR"
          },
          {
            "name": "SEK"
          },
          {
            "name": "CHF"
          },
          {
            "name": "THB"
          },
          {
            "name": "TRY"
          },
          {
            "name": "USD"
          },
          {
            "name": "UYU"
          },
          {
            "name": "VND"
          }
        ]
      },
      {
        "kind": "ENUM",
        "name": "IdentityVerificationStatus",
        "enumValues": [
          {
            "name": "Successful"
          },
          {
            "name": "Failed"
          },
          {
            "name": "Pending"
          },
          {
            "name": "PendingManualReview"
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "UserStatuses",
        "fields": [
          {
            "name": "identityVerification",
            "type": {
              "kind": "ENUM",
              "name": "IdentityVerificationStatus",
              "ofType": null
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "User",
        "fields": [
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "statuses",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "UserStatuses",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "givenName",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "familyName",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "nickname",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "email",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "emailVerified",
            "type": {
              "kind": "SCALAR",
              "name": "Boolean",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "birthdate",
            "type": {
              "kind": "SCALAR",
              "name": "Date",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "marketToken",
            "type": {
              "kind": "OBJECT",
              "name": "MarketToken",
              "ofType": null
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "String"
      },
      {
        "kind": "SCALAR",
        "name": "Boolean"
      },
      {
        "kind": "OBJECT",
        "name": "MarketToken",
        "fields": [
          {
            "name": "access_token",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "expires_in",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "scope",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "token_type",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "Int"
      },
      {
        "kind": "ENUM",
        "name": "LegalType",
        "enumValues": [
          {
            "name": "Individual"
          },
          {
            "name": "Trust"
          },
          {
            "name": "SMSF"
          },
          {
            "name": "Company"
          },
          {
            "name": "Joint"
          }
        ]
      },
      {
        "kind": "ENUM",
        "name": "EntityActiveState",
        "enumValues": [
          {
            "name": "Active"
          },
          {
            "name": "Closed"
          },
          {
            "name": "Pending"
          },
          {
            "name": "Suspended"
          }
        ]
      },
      {
        "kind": "ENUM",
        "name": "ContactStatus",
        "enumValues": [
          {
            "name": "Active"
          },
          {
            "name": "Deleted"
          }
        ]
      },
      {
        "kind": "ENUM",
        "name": "ContactForm",
        "enumValues": [
          {
            "name": "Person"
          },
          {
            "name": "Organisation"
          }
        ]
      },
      {
        "kind": "ENUM",
        "name": "ContactType",
        "enumValues": [
          {
            "name": "AimTextChat"
          },
          {
            "name": "AddressBusiness"
          },
          {
            "name": "AddressPostal"
          },
          {
            "name": "AddressResidence"
          },
          {
            "name": "EmailPrivate"
          },
          {
            "name": "EmailBusiness"
          },
          {
            "name": "FaxBiz"
          },
          {
            "name": "FaxHome"
          },
          {
            "name": "OtherMethod"
          },
          {
            "name": "Pager"
          },
          {
            "name": "PhoneAssistant"
          },
          {
            "name": "PhoneBusiness"
          },
          {
            "name": "PhoneCar"
          },
          {
            "name": "PhoneHome"
          },
          {
            "name": "PhoneMob"
          },
          {
            "name": "SmsTextMessage"
          },
          {
            "name": "SkypeTextChat"
          },
          {
            "name": "WhatsAppTextChat"
          }
        ]
      },
      {
        "kind": "ENUM",
        "name": "InformationMemorandumResult",
        "enumValues": [
          {
            "name": "Success"
          },
          {
            "name": "Failure"
          },
          {
            "name": "Partial"
          }
        ]
      },
      {
        "kind": "INTERFACE",
        "name": "ContactMethod",
        "fields": [
          {
            "name": "contactType",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "ContactType",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "detail",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "sortSeq",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": [],
        "possibleTypes": [
          {
            "kind": "OBJECT",
            "name": "AddressContactMethod"
          },
          {
            "kind": "OBJECT",
            "name": "GenericContactMethod"
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "Address",
        "fields": [
          {
            "name": "city",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "countryName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "line1",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "line2",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "line3",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "postcode",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "state",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "AddressContactMethod",
        "fields": [
          {
            "name": "contactType",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "ContactType",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "detail",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "sortSeq",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "address",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Address",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": [
          {
            "kind": "INTERFACE",
            "name": "ContactMethod"
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "GenericContactMethod",
        "fields": [
          {
            "name": "contactType",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "ContactType",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "detail",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "sortSeq",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": [
          {
            "kind": "INTERFACE",
            "name": "ContactMethod"
          }
        ]
      },
      {
        "kind": "INTERFACE",
        "name": "Contact",
        "fields": [
          {
            "name": "shortName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "status",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "ContactStatus",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "beneficialOwner",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "contactMethods",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INTERFACE",
                "name": "ContactMethod",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": [],
        "possibleTypes": [
          {
            "kind": "OBJECT",
            "name": "PersonContact"
          },
          {
            "kind": "OBJECT",
            "name": "OrganisationContact"
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "PersonContact",
        "fields": [
          {
            "name": "personFirstName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "personFamilyName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "personInits",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "personTitle",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "personBirthdate",
            "type": {
              "kind": "SCALAR",
              "name": "Date",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "shortName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "status",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "ContactStatus",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "beneficialOwner",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "contactMethods",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INTERFACE",
                "name": "ContactMethod",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": [
          {
            "kind": "INTERFACE",
            "name": "Contact"
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "OrganisationContact",
        "fields": [
          {
            "name": "organisationName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "shortName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "status",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "ContactStatus",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "beneficialOwner",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "contactMethods",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INTERFACE",
                "name": "ContactMethod",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": [
          {
            "kind": "INTERFACE",
            "name": "Contact"
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "PerformanceChartPoint",
        "fields": [
          {
            "name": "month",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "fromDate",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Date",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "toDate",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Date",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "returnTotalForPeriodValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "returnTotalForPeriodPercentage",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "Float"
      },
      {
        "kind": "ENUM",
        "name": "EntityStatusName",
        "enumValues": [
          {
            "name": "InformationMemorandum"
          },
          {
            "name": "ActiveState"
          },
          {
            "name": "WholesaleCertificate"
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "EntityStatus",
        "fields": [
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "EntityStatusName",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "value",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Entity",
        "fields": [
          {
            "name": "fen",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "displayName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "legalType",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "LegalType",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "company",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "executiveName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "statuses",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "EntityStatus",
                  "ofType": null
                }
              }
            },
            "args": []
          },
          {
            "name": "activeState",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "EntityActiveState",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "accounts",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Account",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          },
          {
            "name": "contacts",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INTERFACE",
                    "name": "Contact",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          },
          {
            "name": "holdings",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Holding",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "valCcy",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "CurrencyCode",
                    "ofType": null
                  }
                }
              },
              {
                "name": "asAtDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "performance",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "PerformanceSummary",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "valCcy",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "CurrencyCode",
                    "ofType": null
                  }
                }
              },
              {
                "name": "fromDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              },
              {
                "name": "toDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "performanceChart",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "PerformanceChartPoint",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "valCcy",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "CurrencyCode",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "cashStatements",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "NON_NULL",
                "ofType": {
                  "kind": "LIST",
                  "ofType": {
                    "kind": "NON_NULL",
                    "ofType": {
                      "kind": "OBJECT",
                      "name": "CashStatement",
                      "ofType": null
                    }
                  }
                }
              }
            },
            "args": [
              {
                "name": "filterCcy",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "LIST",
                    "ofType": {
                      "kind": "NON_NULL",
                      "ofType": {
                        "kind": "ENUM",
                        "name": "CurrencyCode",
                        "ofType": null
                      }
                    }
                  }
                }
              },
              {
                "name": "fromDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              },
              {
                "name": "toDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "transactions",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Transaction",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "fromDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              },
              {
                "name": "toDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              },
              {
                "name": "filterCcy",
                "type": {
                  "kind": "ENUM",
                  "name": "CurrencyCode",
                  "ofType": null
                }
              }
            ]
          }
        ],
        "interfaces": []
      },
      {
        "kind": "SCALAR",
        "name": "ID"
      },
      {
        "kind": "OBJECT",
        "name": "Asset",
        "fields": [
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "type",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "HoldingPerformance",
        "fields": [
          {
            "name": "totalOpeningValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalClosingValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalAccruedInterestValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalNetTradingValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalContributedValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalDividendValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalFinancingFeeValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalFxGainLossValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalIncomeValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalInterestValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalOtherValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalRealisedValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalUnrealisedValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalReturnValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalWithdrawnValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalUnreconciledValue",
            "type": {
              "kind": "SCALAR",
              "name": "Float",
              "ofType": null
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Holding",
        "fields": [
          {
            "name": "holdingId",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "entity",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Entity",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "account",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Account",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "assetName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "assetSymbol",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "assetType",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "exchangeCode",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "currency",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "CurrencyCode",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "quantity",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "avgPurchasePrice",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalPurchasePrice",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalPurchaseValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalGainLossValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "marketPrice",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "marketValue",
            "type": {
              "kind": "SCALAR",
              "name": "Float",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "totalMarketValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalMarketPrice",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "performance",
            "type": {
              "kind": "OBJECT",
              "name": "HoldingPerformance",
              "ofType": null
            },
            "args": [
              {
                "name": "fromDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              },
              {
                "name": "toDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              },
              {
                "name": "valCcy",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "CurrencyCode",
                    "ofType": null
                  }
                }
              }
            ]
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Transaction",
        "fields": [
          {
            "name": "movementId",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "entity",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Entity",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "account",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Account",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "assetName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "assetSymbol",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "narrative",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "exchangeCode",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "currency",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "CurrencyCode",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "effectiveDate",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Date",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "transactionType",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "quantity",
            "type": {
              "kind": "SCALAR",
              "name": "Float",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "totalGrossCashChange",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalNetCashChange",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "assetPurchasePrice",
            "type": {
              "kind": "SCALAR",
              "name": "Float",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "totalNetAssetPurchasePrice",
            "type": {
              "kind": "SCALAR",
              "name": "Float",
              "ofType": null
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "CashStatement",
        "fields": [
          {
            "name": "movementId",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "assetName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "assetSymbol",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "cashBalance",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "currency",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "CurrencyCode",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "narrative",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "effectiveDate",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Date",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "grossAmount",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "transactionType",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalGrossCashChange",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalNetCashChange",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "assetPurchasePrice",
            "type": {
              "kind": "SCALAR",
              "name": "Float",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "totalNetAssetPurchasePrice",
            "type": {
              "kind": "SCALAR",
              "name": "Float",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "netAssetCost",
            "type": {
              "kind": "SCALAR",
              "name": "Float",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "exchangeCode",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "PerformanceSummary",
        "fields": [
          {
            "name": "openingDate",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Date",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "closingDate",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Date",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalOpeningValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalClosingValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalContributedValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalAccruedInterestValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalDividendValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalFinancingFeeValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalFxGainLossValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalInterestValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalRealisedValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalUnrealisedValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalReturnValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalWithdrawnValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalNetCapitalFlowsValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalIncomeTakenDirectlyValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalAnnualisedPerformanceValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "totalAnnualisedTwrPerformanceValue",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Float",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Account",
        "fields": [
          {
            "name": "fan",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "fen",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "displayName",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "payId",
            "type": {
              "kind": "OBJECT",
              "name": "PayId",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "hasTradingAccess",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "holdings",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Holding",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "asAtDate",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Date",
                    "ofType": null
                  }
                }
              },
              {
                "name": "valCcy",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "CurrencyCode",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "performance",
            "type": {
              "kind": "OBJECT",
              "name": "PerformanceSummary",
              "ofType": null
            },
            "args": [
              {
                "name": "fromDate",
                "type": {
                  "kind": "SCALAR",
                  "name": "Date",
                  "ofType": null
                }
              },
              {
                "name": "toDate",
                "type": {
                  "kind": "SCALAR",
                  "name": "Date",
                  "ofType": null
                }
              },
              {
                "name": "valCcy",
                "type": {
                  "kind": "ENUM",
                  "name": "CurrencyCode",
                  "ofType": null
                }
              }
            ]
          },
          {
            "name": "transactions",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "OBJECT",
                "name": "Transaction",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "filterCcy",
                "type": {
                  "kind": "ENUM",
                  "name": "CurrencyCode",
                  "ofType": null
                }
              },
              {
                "name": "fromDate",
                "type": {
                  "kind": "SCALAR",
                  "name": "Date",
                  "ofType": null
                }
              },
              {
                "name": "toDate",
                "type": {
                  "kind": "SCALAR",
                  "name": "Date",
                  "ofType": null
                }
              }
            ]
          },
          {
            "name": "cashStatements",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "LIST",
                    "ofType": {
                      "kind": "OBJECT",
                      "name": "CashStatement",
                      "ofType": null
                    }
                  }
                }
              }
            },
            "args": [
              {
                "name": "filterCcy",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "LIST",
                    "ofType": {
                      "kind": "NON_NULL",
                      "ofType": {
                        "kind": "ENUM",
                        "name": "CurrencyCode",
                        "ofType": null
                      }
                    }
                  }
                }
              },
              {
                "name": "fromDate",
                "type": {
                  "kind": "SCALAR",
                  "name": "Date",
                  "ofType": null
                }
              },
              {
                "name": "toDate",
                "type": {
                  "kind": "SCALAR",
                  "name": "Date",
                  "ofType": null
                }
              }
            ]
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "DocumentBody",
        "fields": [
          {
            "name": "key",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "value",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Document",
        "fields": [
          {
            "name": "id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "url",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "body",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "DocumentBody",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "M2AssetGroup",
        "fields": [
          {
            "name": "m2id",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Int",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "name",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "shortName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "BSBInformation",
        "fields": [
          {
            "name": "bsb",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "bankCode",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "financialInstitution",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "branchName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "EntityQueryFilter",
        "inputFields": [
          {
            "name": "activeState",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "EntityActiveStateFilter",
              "ofType": null
            }
          },
          {
            "name": "statusFilter",
            "type": {
              "kind": "LIST",
              "ofType": {
                "kind": "INPUT_OBJECT",
                "name": "EntityStatusFilter",
                "ofType": null
              }
            }
          }
        ]
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "EntityStatusFilter",
        "inputFields": [
          {
            "name": "status",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "EntityStatusName",
                "ofType": null
              }
            }
          },
          {
            "name": "eq",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            }
          },
          {
            "name": "ne",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            }
          }
        ]
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "EntityActiveStateFilter",
        "inputFields": [
          {
            "name": "eq",
            "type": {
              "kind": "ENUM",
              "name": "EntityActiveState",
              "ofType": null
            }
          },
          {
            "name": "ne",
            "type": {
              "kind": "ENUM",
              "name": "EntityActiveState",
              "ofType": null
            }
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "Query",
        "fields": [
          {
            "name": "user",
            "type": {
              "kind": "OBJECT",
              "name": "User",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "entities",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Entity",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "fens",
                "type": {
                  "kind": "LIST",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID",
                    "ofType": null
                  }
                }
              },
              {
                "name": "filter",
                "type": {
                  "kind": "INPUT_OBJECT",
                  "name": "EntityQueryFilter",
                  "ofType": null
                }
              }
            ]
          },
          {
            "name": "accounts",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "Account",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "fans",
                "type": {
                  "kind": "LIST",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "bsbLookup",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "BSBInformation",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "bsb",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "symbols",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "OBJECT",
                  "name": "SymbolInformation",
                  "ofType": null
                }
              }
            },
            "args": [
              {
                "name": "codes",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "LIST",
                    "ofType": {
                      "kind": "NON_NULL",
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "String",
                        "ofType": null
                      }
                    }
                  }
                }
              }
            ]
          }
        ],
        "interfaces": []
      },
      {
        "kind": "ENUM",
        "name": "SymbolStatus",
        "enumValues": [
          {
            "name": "Open"
          },
          {
            "name": "Halted"
          },
          {
            "name": "PreListed"
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "PublicDocument",
        "fields": [
          {
            "name": "title",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "url",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "SymbolInformation",
        "fields": [
          {
            "name": "code",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "nav",
            "type": {
              "kind": "SCALAR",
              "name": "Float",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "blurb",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "bannerImageUrl",
            "type": {
              "kind": "SCALAR",
              "name": "String",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "symbolStatus",
            "type": {
              "kind": "ENUM",
              "name": "SymbolStatus",
              "ofType": null
            },
            "args": []
          },
          {
            "name": "documents",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "PublicDocument",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "PayId",
        "fields": [
          {
            "name": "words",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  }
                }
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "PayIdInput",
        "inputFields": [
          {
            "name": "words",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  }
                }
              }
            }
          }
        ]
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "WithdrawRecipient",
        "inputFields": [
          {
            "name": "DirectDeposit",
            "type": {
              "kind": "INPUT_OBJECT",
              "name": "DirectDepositRecipient",
              "ofType": null
            }
          }
        ]
      },
      {
        "kind": "INPUT_OBJECT",
        "name": "DirectDepositRecipient",
        "inputFields": [
          {
            "name": "accountName",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "String",
                "ofType": null
              }
            }
          },
          {
            "name": "bsb",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            }
          },
          {
            "name": "accountNumber",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            }
          }
        ]
      },
      {
        "kind": "OBJECT",
        "name": "TransactionResponse",
        "fields": [
          {
            "name": "reference",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "success",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "InformationMemorandumResponse",
        "fields": [
          {
            "name": "success",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "ENUM",
                "name": "InformationMemorandumResult",
                "ofType": null
              }
            },
            "args": []
          }
        ],
        "interfaces": []
      },
      {
        "kind": "OBJECT",
        "name": "Mutation",
        "fields": [
          {
            "name": "generateNewPayIds",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "PayId",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "amount",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Int",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "createEntity",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "ID",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "displayName",
                "type": {
                  "kind": "SCALAR",
                  "name": "String",
                  "ofType": null
                }
              },
              {
                "name": "legalName",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  }
                }
              },
              {
                "name": "legalType",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "LegalType",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "createAccounts",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "fen",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID",
                    "ofType": null
                  }
                }
              },
              {
                "name": "accounts",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "LIST",
                    "ofType": {
                      "kind": "NON_NULL",
                      "ofType": {
                        "kind": "SCALAR",
                        "name": "String",
                        "ofType": null
                      }
                    }
                  }
                }
              }
            ]
          },
          {
            "name": "updateProfile",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "User",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "nickname",
                "type": {
                  "kind": "SCALAR",
                  "name": "String",
                  "ofType": null
                }
              }
            ]
          },
          {
            "name": "addPayIds",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "PayId",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "input",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "LIST",
                    "ofType": {
                      "kind": "NON_NULL",
                      "ofType": {
                        "kind": "INPUT_OBJECT",
                        "name": "PayIdInput",
                        "ofType": null
                      }
                    }
                  }
                }
              }
            ]
          },
          {
            "name": "undoPayIds",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "LIST",
                "ofType": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "OBJECT",
                    "name": "PayId",
                    "ofType": null
                  }
                }
              }
            },
            "args": [
              {
                "name": "input",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "LIST",
                    "ofType": {
                      "kind": "NON_NULL",
                      "ofType": {
                        "kind": "INPUT_OBJECT",
                        "name": "PayIdInput",
                        "ofType": null
                      }
                    }
                  }
                }
              }
            ]
          },
          {
            "name": "createCashTransfer",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "TransactionResponse",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "fromFan",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID",
                    "ofType": null
                  }
                }
              },
              {
                "name": "toFan",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID",
                    "ofType": null
                  }
                }
              },
              {
                "name": "amount",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Float",
                    "ofType": null
                  }
                }
              },
              {
                "name": "currency",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "CurrencyCode",
                    "ofType": null
                  }
                }
              },
              {
                "name": "description",
                "type": {
                  "kind": "SCALAR",
                  "name": "String",
                  "ofType": null
                }
              }
            ]
          },
          {
            "name": "createWithdraw",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "TransactionResponse",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "amount",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Float",
                    "ofType": null
                  }
                }
              },
              {
                "name": "currency",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "ENUM",
                    "name": "CurrencyCode",
                    "ofType": null
                  }
                }
              },
              {
                "name": "description",
                "type": {
                  "kind": "SCALAR",
                  "name": "String",
                  "ofType": null
                }
              },
              {
                "name": "fan",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID",
                    "ofType": null
                  }
                }
              },
              {
                "name": "recipient",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "INPUT_OBJECT",
                    "name": "WithdrawRecipient",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "acceptInformationMemorandum",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "InformationMemorandumResponse",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "fen",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "ID",
                    "ofType": null
                  }
                }
              },
              {
                "name": "requestsEmail",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Boolean",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "requestVerificationEmail",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean",
                "ofType": null
              }
            },
            "args": []
          },
          {
            "name": "documentUrl",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "Document",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "size",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "Int",
                    "ofType": null
                  }
                }
              },
              {
                "name": "mimeType",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "submitWholesaleCertificate",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "fen",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  }
                }
              },
              {
                "name": "documentId",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "identityVerification",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "OBJECT",
                "name": "User",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "digitalIdCode",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  }
                }
              }
            ]
          },
          {
            "name": "renameAccount",
            "type": {
              "kind": "NON_NULL",
              "ofType": {
                "kind": "SCALAR",
                "name": "Boolean",
                "ofType": null
              }
            },
            "args": [
              {
                "name": "fan",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  }
                }
              },
              {
                "name": "displayName",
                "type": {
                  "kind": "NON_NULL",
                  "ofType": {
                    "kind": "SCALAR",
                    "name": "String",
                    "ofType": null
                  }
                }
              }
            ]
          }
        ],
        "interfaces": []
      }
    ],
    "directives": []
  }
};

import * as gqlTada from 'gql.tada';

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection
  }
}