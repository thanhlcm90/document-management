'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles', 'ngTableParams', 'Utils', 'Notify',
    function($scope, $stateParams, $location, Authentication, Articles, ngTableParams, Utils, Notify) {
        var initializing = true

        $scope.authentication = Authentication;
        $scope.groupby = 'title';
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

        $scope.create = function() {
            var article = new Articles({
                title: this.title,
                content: this.content,
                org: this.org,
                range: this.range
            });
            article.$save(function(response) {
                $scope.content = '';
                Notify.addSuccess();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

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

        $scope.update = function() {
            var article = $scope.article;

            article.$update(function() {
                $location.path('articles' + article._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.find = function() {
            $scope.articles = Articles.query();
        };

        $scope.findOne = function() {
            $scope.article = Articles.get({
                articleId: $stateParams.articleId
            });
        };
    }
]);