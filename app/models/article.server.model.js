'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: { // danh mục thủ tục hành chính
        type: String,
        default: '',
        trim: true,
        required: 'Danh mục thủ tục hành chính không được trống'
    },
    sub_title: { // danh mục thủ tục hành chính 2
        type: String,
        default: '',
        trim: true
    },
    content: { // tên thủ tục hành chính
        type: String,
        default: '',
        trim: true,
        required: 'Tên thủ tục hành chính không được trống',
        index: 'text'
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    range: { // lĩnh vực
        type: String,
        default: '',
        trim: true,
        required: 'Lĩnh vực không được trống'
    },
    org: { // Cơ quan thực hiện
        type: String,
        default: '',
        trim: true,
        required: 'Cơ quan thực hiện không được trống'
    },
    user: { // tài liệu của người dùng nào
        type: Schema.ObjectId,
        ref: 'User'
    },
    doc: {
        type: String,
        default: ''
    }
});

mongoose.model('Article', ArticleSchema);
