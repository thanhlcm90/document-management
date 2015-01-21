'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    async = require('async'),
    validator = require('validator'),
    errorHandler = require('./errors.server.controller'),
    Article = mongoose.model('Article'),
    _ = require('lodash');


/**
 * make query paging
 *
 * @param  {[type]} req   [description]
 * @param  {[type]} query [description]
 * @return {[type]}       [description]
 */
var paging = function(query, req, callback) {
    var page = req.query.page;
    var page_size = req.query.page_size;
    var order_by = req.query.order_by;

    // xử lý page
    if (validator.isNull(page))
        page = 1;
    if (validator.isInt(page))
        page = parseInt(page);
    else
        page = 1;
    if (page === 0) page = 1;

    // xử lý page_size
    if (validator.isNull(page_size))
        page_size = 10;
    if (validator.isInt(page_size))
        page_size = parseInt(page_size);
    else
        page_size = 10;
    if (page_size === 0) page_size = 10;

    var model = query.model;
    async.parallel([function(cb) {
        model.count(query._conditions, function(err, cnt) {
            if (err) {
                cb(err);
            } else {
                cb(null, cnt);
            }
        });
    }, function(cb) {

        // order by
        if (!validator.isNull(order_by))
            query.sort(order_by);

        // paging
        if (page_size > 0) {
            query.skip((page - 1) * page_size);
            query.limit(page_size);
        }

        query.exec(function(err, data) {
            if (err) {
                cb(err);
            } else {
                cb(null, data);
            }
        });
    }], function(err, result) {
        if (err) {
            callback(err, []);
        } else {
            var data = result[1];
            var count = result[0];
            if (page_size < 0) page_size = count;
            var r = {
                item_total: count,
                page_count: count === 0 ? 0 : (~~((count - 1) / page_size) + 1),
                page: page,
                page_size: page_size,
                data: data
            };
            callback(null, r);
        }
    });
};

/**
 * Create a article
 */
exports.create = function(req, res) {
    var article = new Article(req.body);
    article.user = req.user;

    article.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * Show the current article
 */
exports.read = function(req, res) {
    res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function(req, res) {
    var article = req.article;
    article = _.extend(article, req.body);
    article.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
    var article = req.article;

    article.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

/**
 * List of Articles
 */
exports.list = function(req, res) {
    var query = Article.find().sort('title');
    paging(query, req, function(err, articles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(articles);
        }
    });
};

function extractKeywords(text) {
    if (!text) return [];

    return text.
    split(/\s+/).
    filter(function(v) {
        return v.length > 2;
    }).
    filter(function(v, i, a) {
        return a.lastIndexOf(v) === i;
    });
}

exports.search = function(req, res) {
    var search_string = req.query.search_string;
    var find = {
        '$text': {
            '$search': search_string
        }
    };
    var findScore = {
        'score': {
            '$meta': 'textScore'
        }
    };
    var sort = {
        'score': {
            '$meta': 'textScore'
        }
    };
    var query = Article.find(find, findScore).sort(sort);
    paging(query, req, function(err, articles) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(articles);
        }
    });
};

/**
 * Article middleware
 */
exports.articleByID = function(req, res, next, id) {
    Article.findById(id).populate('user', 'displayName').exec(function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + id));
        req.article = article;
        next();
    });
};

/**
 * Article authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.article.user.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};
