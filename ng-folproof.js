(function() {
	var app = angular.module('app', []);

	function ProofController($scope, samples, proofRenderer) {
		this.$scope = $scope;
		this.samples = samples;

		$scope.proofSrc = '';
		this.$scope.$watchGroup(['proofSrc', 'paren'], function(newVals) {
			try {
			var ast = parser.parse(newVals[0]);
			$scope.result = folproof.Verifier.verifyFromAST(ast);
			$scope.proofHtml = proofRenderer(ast, { paren: newVals[1] });
			console.log(ast, $scope.result, $scope.proofHtml);
			} catch(ex) {
				console.log(ex);
			}
		});
	}
	angular.extend(ProofController.prototype, {
		setProof: function(id) {
			this.$scope.proofSrc = this.samples(id);
		},
		
	});
	app.controller('ProofController', ['$scope', 'ProofSamples', 'ProofRenderer', ProofController]);

	app.factory('ProofSamples', function() {
		return function(id) {
			return document.getElementById('example'+id).innerText;
		};
	});

	app.factory('ProofRenderer', ['$sce', function($sce) {
		return function(ast, options) {
			var html = folproofWeb.render(ast, { parentheses : options.paren }).html();
			return $sce.trustAsHtml(html);
		};
	}]);
})();
