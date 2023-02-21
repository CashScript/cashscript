
const { DefaultReporter } = require('@jest/reporters')

// Thanks to https://github.com/facebook/jest/issues/4156#issuecomment-757376195
class LogOnFailReporter extends DefaultReporter {
	constructor() {
		super(...arguments)
	}

	printTestFileHeader(_testPath, config, result) {
		const console = result.console

		if(result.numFailingTests === 0 && !result.testExecError) {
			result.console = null
		}

		super.printTestFileHeader(...arguments)

		result.console = console
	}
}

module.exports = LogOnFailReporter
