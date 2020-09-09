#!/bin/bash

find ./dot -type f -name '*' -exec sh -c 'f="{}"; dot -Tsvg "$f" >  "svg/$(basename $f .dot).svg" ' \;