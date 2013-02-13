# Adapters

Specification of the data passed to and returned from CRUD functions

## Create

**Parameters**

* Options
  * Model data
  * Table (keyspace, identifier, etc)
  * Primary Key
* Callback (if async)

**Return (via callback if async)**

* Error (if any)
* Model data (including any db-generated data)

## Read

**Parameters**

* Options
  * Query (as Array)
  * Table (keyspace, identifier, etc)
* Callback (if async)

**Return (via callback if async)**

* Error (if any)
* Model data (as Array, always)

## Update

**Parameters**

* Options
  * Updated model data (only)
  * Table (keyspace, identifier, etc)
* Callback (if async)

**Return (via callback if async)**

* Error (if any)
* Model data (all data)

## Delete

**Parameters**

* Options
  * Primary ID
  * Table
* Callback (if async)

**Return (via callback if async)**

* Error (if any)