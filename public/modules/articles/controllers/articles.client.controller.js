'use strict';

angular.module('articles').controller('ArticlesController', articlesController);
angular.module('articles').controller('ArticlesEditController', articlesEditController);
angular.module('articles').controller('ArticlesInfoController', ArticlesInfoController);

angular.module('articles').directive('bindHtmlUnsafe', function( $compile ) {
    return function( $scope, $element, $attrs ) {

        var compile = function( newHTML ) { // Create re-useable compile function
            newHTML = $compile(newHTML)($scope); // Compile html
            $element.html('').append(newHTML); // Clear and append it
        };

        var htmlName = $attrs.bindHtmlUnsafe; // Get the name of the variable 
                                              // Where the HTML is stored

        $scope.$watch(htmlName, function( newHTML ) { // Watch for changes to 
                                                      // the HTML
            if(!newHTML) return;
            compile(newHTML);   // Compile it
        });

    };
});

function ArticlesInfoController($scope, $stateParams, $location, Authentication, Articles, ngTableParams, Utils, Notify) {
    $scope.authentication = Authentication;

    $scope.remove = function(article) {
        if (article) {
            $scope.article = Articles.get({
                articleId: article._id
            }, function(data) {
                $scope.article.$remove(function() {
                    $scope.tableParams.reload();
                });
            });
        } else {
            $scope.article.$remove(function() {
                $location.path('articles');
            });
        }
    };

    $scope.findOne = function() {
        $scope.article = Articles.get({
            articleId: $stateParams.articleId
        });
    };

    $scope.printClick = function() {
        print($("#article-body").html(), $scope.article.content);
    }

    function print(data, title) {
        var mywindow = window.open('', title, 'height=400,width=600');
        mywindow.document.write('<html><head>');
        /*optional stylesheet*/ //mywindow.document.write('<link rel="stylesheet" href="main.css" type="text/css" />');
        mywindow.document.write('</head><body >');
        mywindow.document.write(data);
        mywindow.document.write('</body></html>');

        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10

        mywindow.print();
        mywindow.close();

        return true;
    }

}

function articlesEditController($scope, $stateParams, $location, Authentication, Articles, ngTableParams, Utils, Notify) {
    $scope.authentication = Authentication;
    // setup editor options
    $scope.editorOptions = {
        language: 'vi',
        allowedContent: true
    };

    $scope.findOne = function() {
        $scope.article = Articles.get({
            articleId: $stateParams.articleId
        });
    };
    $scope.create = function() {
        var article = new Articles({
            title: this.title,
            content: this.content,
            org: this.org,
            range: this.range,
            description: this.description,
            doc: this.doc,
            can_cu_phap_ly: this.can_cu_phap_ly
        });
        article.$save(function(response) {
            $scope.content = '';
            Notify.addSuccess();
        }, function(errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };
    $scope.update = function() {
        var article = $scope.article;
        article.$update(function() {
            $location.path('articles/' + article._id);
        }, function(errorResponse) {
            $scope.error = errorResponse.data.message;
        });
    };

}

function articlesController($scope, $stateParams, $location, Authentication, Articles, ngTableParams, Utils, Notify) {
    var initializing = true
    $scope.authentication = Authentication;
    $scope.groupby = 'title';
    console.log($scope.authentication);
    // config tooltip
    $('[data-toggle="tooltip"]').tooltip();

    $scope.search = function() {
        $location.search('search_string', $scope.search_string);
    };

    $scope.checkKeyPressed = function(event) {
        if (event.keyCode === 13) {
            $scope.search();
        }
    };

    $scope.addNew = function() {
        $location.path('articles/create');
    };

    // kiểm tra sự thay đổi của groupby
    $scope.$watch('groupby', function(value) {
        // thay đổi tham số groupby, reload lại dữ liệu
        // bỏ qua lần đầu tiên
        if (!initializing) {
            $scope.tableParams.settings().groupBy = value;
            $scope.tableParams.reload();
            initializing = false;
        }
    });

    $scope.tableParams = new ngTableParams({
        page: 1, // show first page
        count: 10, // count per page
        sorting: {
            created: 'desc' // initial sorting
        }
    }, {
        groupBy: $scope.groupby,
        total: 0, // length of data
        counts: [], // hide page counts control
        getData: function($defer, params) {
            var param = Utils.parsePagingParams(params);
            var r;
            if ($stateParams.search_string) {
                param.search_string = $stateParams.search_string;
                $scope.search_string = $stateParams.search_string;
                r = Articles.search(param);
            } else {
                r = Articles.query(param);
            }
            if (r) {
                r.$promise.then(function(response) {
                    params.total(response.item_total);
                    $scope.articles = response.data;
                    $defer.resolve($scope.articles);
                }, function(err, statusCode) {
                    params.total(0);
                    $scope.articles = [];
                    $defer.resolve($scope.articles);
                });
            } else {
                params.total(0);
                $defer.resolve([]);
            }
        }
    });

    $scope.find = function() {
        $scope.articles = Articles.query();
    };

    $scope.rowClick = function(id) {
        $location.path("/articles/" + id);
    }
}
