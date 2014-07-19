MOCHA?=node_modules/.bin/_mocha
REPORTER?=spec
FLAGS=--reporter $(REPORTER)
DEBUG=?

build:
	@echo "-----> install npm modules from clean state"
	@echo "       remove existing node_modules folder"
	@rm -rf node_modules
	@echo "       npm install --silent"
	@npm install --silent

test:
	@NODE_ENV="test" \
		$(MOCHA) $(FLAGS) $(shell find test -name "*-test.js")

one:
	@NODE_ENV="test" \
		$(MOCHA) $(FLAGS)   $(NAME)

integration:
	@NODE_ENV="test" \
		$(MOCHA) $(FLAGS) $(shell find test/integration -name "*-test.js")

.PHONY: test docs
