install: # Install dependencies
	npm ci
	npm link

test: # Run tests
	@npm test -s

test-debug: # Run tests with main debug
	@DEBUG=page-loader.* make test

test-debug-axios: # Run tests with axios debug
	@DEBUG=axios make test

test-debug-nock: # Run tests with nock debug
	@DEBUG=nock.* make test

test-watch: # Run tests with watch
	@npm test -s -- --watch

test-coverage: # Run coverage tests
	@npm test -s -- --coverage --coverageProvider=v8

lint: # Run linter
	@npx eslint .

publish: # Publish npm package
	@npm publish --dry-run
