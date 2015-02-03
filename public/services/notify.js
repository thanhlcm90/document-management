'use strict';

angular.module(ApplicationConfiguration.applicationModuleName).factory('Notify', ['toaster', factory]);

function factory(toaster) {

    return {
        error: error,
        info: info,
        success: success,
        warning: warning,

        addSuccess: addSuccess,
        editSuccess: editSuccess,
        addError: addError,
        editError: editError
    };

    function addSuccess() {
        success("Thêm dữ liệu thành công.");
    }

    function editSuccess() {
        success("Sửa dữ liệu thành công.");
    }

    function addError() {
        error("Thêm dữ liệu không thành cônh. Hãy thử lại!");
    }

    function editError() {
        error("Sửa dữ liệu không thành cônh. Hãy thử lại!");
    }

    /////////////////////
    function error(message, title) {
        var notify = toaster.pop('error', title, message);
    }

    function info(message, title) {
        var notify = toaster.pop('info', title, message);
    }

    function success(message, title) {
        var notify = toaster.pop('success', title, message);
    }

    function warning(message, title) {
        var notify = toaster.pop('warning', title, message);
    }
};
