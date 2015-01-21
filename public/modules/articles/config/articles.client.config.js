'use strict';

// Configuring the Articles module
angular.module('articles').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Văn bản', 'articles', 'dropdown', '/articles(/create)?');
		Menus.addSubMenuItem('topbar', 'articles', 'Danh sách văn bản', 'articles');
		Menus.addSubMenuItem('topbar', 'articles', 'Thêm mới văn bản', 'articles/create');
	}
]);