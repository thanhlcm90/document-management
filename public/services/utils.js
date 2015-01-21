'use strict';

angular.module(ApplicationConfiguration.applicationModuleName).factory('Utils', [factory]);

function factory() {
    return {
        parsePagingParams: parsePagingParams
    };

    function parsePagingParams(params) {
        var param = params.url();
        var orderBy = params.sorting() ? params.orderBy() : "";
        var filter = params.filter();
        var filters = "";
        var r = {
            page: param.page,
            page_size: param.count,
            order_by: orderBy
        };
        if (filter) {
            r['filter'] = {};
            Object.keys(filter).forEach(function(item) {
                if (filter[item].length != 0) {
                    r['filter'][item] = filter[item];
                }
            });
        }
        return r;
    }
}
