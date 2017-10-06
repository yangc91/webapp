/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50525
Source Host           : localhost:3306
Source Database       : webapp

Target Server Type    : MYSQL
Target Server Version : 50525
File Encoding         : 65001

Date: 2017-09-30 11:23:26
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for t_sys_authorities
-- ----------------------------
DROP TABLE IF EXISTS `t_sys_authorities`;
CREATE TABLE `t_sys_authorities` (
  `c_id` varchar(32) NOT NULL,
  `c_code` varchar(32) NOT NULL,
  `c_name` varchar(50) NOT NULL,
  PRIMARY KEY (`c_id`),
  UNIQUE KEY `ix_auth_username` (`c_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_sys_authorities
-- ----------------------------

-- ----------------------------
-- Table structure for t_sys_user
-- ----------------------------
DROP TABLE IF EXISTS `t_sys_user`;
CREATE TABLE `t_sys_user` (
  `c_id` varchar(32) NOT NULL,
  `n_create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `c_email` varchar(255) DEFAULT NULL COMMENT '邮箱',
  `c_real_name` varchar(32) DEFAULT NULL COMMENT '真实姓名',
  `c_mobile` varchar(32) DEFAULT NULL COMMENT '电话',
  `org_id` varchar(64) DEFAULT NULL,
  `c_password` varchar(64) NOT NULL,
  `c_qq` varchar(20) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `n_state` tinyint(2) DEFAULT NULL COMMENT '状态：0-删除  1-正常  2-未激活 3-冻结',
  `c_login_name` varchar(50) NOT NULL,
  `position_id` varchar(32) DEFAULT NULL,
  `n_sort_order` int(11) DEFAULT NULL COMMENT '排序',
  `n_modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`c_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of t_sys_user
-- ----------------------------
INSERT INTO `t_sys_user` VALUES ('067629e04c2f40ad887f2ff6ba574fcf', null, null, 'realName2', null, null, '$2a$10$t4OxQOAcq3P22w4xXqKwvuOl/2n5bRXOgvUAQlP58fCXLBVM8bOEm', null, null, null, 'test2', null, null, null);
INSERT INTO `t_sys_user` VALUES ('3f60dbe00fc34ab589536ab9989318dd', null, null, 'realName3upp', null, null, '$2a$10$t4OxQOAcq3P22w4xXqKwvuOl/2n5bRXOgvUAQlP58fCXLBVM8bOEm', null, null, null, 'test3', null, null, null);
INSERT INTO `t_sys_user` VALUES ('763404a8cf6f485f82e4bec9d9c8f255', null, null, 'realName1', null, null, '$2a$10$t4OxQOAcq3P22w4xXqKwvuOl/2n5bRXOgvUAQlP58fCXLBVM8bOEm', null, null, null, 'test1', null, null, null);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `username` varchar(50) NOT NULL,
  `password` varchar(500) NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of users
-- ----------------------------
