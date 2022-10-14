![CI](https://github.com/nearform/bench-template/actions/workflows/ci.yml/badge.svg?event=push)

# Docusaurus Lyra Search Plugin

This is a Docusaurus Search Plugin powered by LyraJS.

At build time, it scans every HTML file produced during the build phase to create an index for Lyra.  
This index will be saved inside the output directory, in order to be fetched and processed by Lyra at runtime.

*NOTE*: as the index is generated at build time, search will not be available on the documentation development phase.
