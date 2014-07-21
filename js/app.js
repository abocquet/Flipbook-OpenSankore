'use strict' ;

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};


var app = angular.module('Flipbook', ['ui.sortable']);

app.controller('MainController', function($scope){

	if(typeof sankore != 'undefined')
	sankore.enableDropOnWidget();

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

	$scope.prev = function(){
		if($scope.currentIndex > 0)
		$scope.currentIndex-- ;
	}

	$scope.next = function(){
		if($scope.currentIndex < $scope.images.length - 1)
		$scope.currentIndex++ ;
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

app.directive("dropImage", function (){
	return {
		restrict: 'A',
		link: function ($scope, elem, attributes) {

			elem.bind('drop', function(e){
				var data = e.originalEvent.dataTransfer.getData("text/plain");

				var path = $($.parseXML(data)).find('path').text();
				$scope.images.push(path) ;

				$scope.$apply();
			});

			elem.bind('dragover', function(){
				return false ;
			})

		}
	};
});
