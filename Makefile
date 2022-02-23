install: # Install dependencies
	npm ci
	npm link

test: # Run tests
	npm test -s

test-watch: # Run tests with watch
	npm test -s -- --watch

test-coverage: # Run coverage tests
	npm test -s -- --coverage --coverageProvider=v8

lint: # Run linter
	npx eslint .

publish: # Publish npm package
	npm publish --dry-run
