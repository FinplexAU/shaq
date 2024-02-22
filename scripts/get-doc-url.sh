#!/usr/bin/env bash

if [ -f ".env" ]
then
  source .env
fi

if [ -z "${CENTRE_API_DOC}" ]
then
  echo "http://127.0.0.1:2003/docs"
else
  echo $CENTRE_API_DOC
fi