'use strict' ;

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

var app = angular.module('Flipbook', ['ui.sortable']);

app.controller('MainController', function($scope){

	$scope.currentIndex = 0 ;
	$scope.editing = true ;

	$scope.images = [
		"images/1.jpg",
		"images/2.jpg",
		"images/3.jpg"
	] ;

	$scope.toggleMode = function(){
		$scope.editing = !$scope.editing ;
	}

});


app.controller('ShowController', function($scope){

	$scope.next = function(){
		if($scope.currentIndex == $scope.images.length - 1)
		$scope.currentIndex++ ;
	}

	$scope.prev = function(){
		if($scope.currentIndex > 0)
		$scope.currentIndex-- ;
	}

});

app.controller('EditController', function($scope){

	$scope.selectImage = function(index){
		$scope.currentIndex = index ;
	};

	$scope.deleteImage = function(index){

		$scope.currentIndex-- 
		if($scope.currentIndex < 0){
			$scope.currentIndex = 0 ;
		}

		$scope.images.splice(index, 1);
	}

	$scope.sortableOptions = {
		axis: 'y',
		start: function(){
			$scope.sortableOptions.savedState = $scope.images.slice(0) ;
		},
		stop: function(e, ui){

			$scope.currentIndex = $scope.images.indexOf($scope.sortableOptions.savedState[$scope.currentIndex]);
			$scope.sortableOptions.savedState = "";

		}
	};

});

app.directive("fileread", [function () {
	return {
		link: function ($scope, element, attributes) {

			element.bind("change", function (changeEvent) {

				var reader = new FileReader();
				reader.onload = function (loadEvent) {
					$scope.$apply(function(){
						$scope.images.push(loadEvent.target.result);
					});
				}

				reader.readAsDataURL(changeEvent.target.files[0]);

			});

		}
	}
}]);