# mercurius-stash

Mercurius code stash to investigate resolver error behavior.

Simple server implementing query and type resolver to return optional / required data and throw errors.

## Dev

Start the sample server

```
npm install
npm start
```

## Sample queries

```
query {
	ok: resolverReturnOptional(code: 200)
 	err1: resolverReturnOptional(code: 418)
 	err2: resolverReturnOptional(code: 422)
}
```
Expected to return:
- data for `ok`: ✅
- error for `err1`: ✅ 
- error for `err2`: ✅

```
query {
	ok: resolverReturnRequired(code: 200)
 	err1: resolverReturnRequired(code: 418)
 	err2: resolverReturnRequired(code: 422)
}
```
Expected to return 
- data for `ok`: ❌
- error for `err1`: ❌
- error for `err2`: ❌

```
query {
	passAll: entity {
		optionalField(code: 200)
		requiredField(code: 200)
	}
	optionalFail: entity {
		optionalField(code: 418)
		requiredField(code: 200)
	}
	requiredFail: entity {
		optionalField(code: 200)
		requiredField(code: 418)
	}
}
```
Expected to return:
- data for `passAll`: ✅
- partial data for `optionalFail`: ✅ 
- null for `requiredFail`: ✅
- errors for `optionalFail.optionalField`: ✅
- errors for `optionalFail.requiredField`: ✅

## Unit tests

`npm test`

Fails above expectation
