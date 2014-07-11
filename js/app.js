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

	$scope.displayHelp = function(){
		$('#help').modal({});
	}

});


app.controller('ShowController', function($scope){

	$scope.currentPages = function(){

		var pages = [ this.currentIndex ] ;
		if(this.mode == 2 && this.currentIndex < this.images.length){
			pages.push(this.currentIndex + 1);
		}

		return pages ;

	};

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

		if(index == (this.images.length - 1) || index <= this.currentIndex){
			$scope.currentIndex-- ;
		}

		this.images.splice(index, 1);
	}

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