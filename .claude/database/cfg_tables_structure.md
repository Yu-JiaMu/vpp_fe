```sql
CREATE TABLE cfg_vpp_operator(
    `id` BIGINT UNSIGNED NOT NULL  COMMENT '运营商标识;雪花' ,
    `operator_code` VARCHAR(50) NOT NULL  COMMENT '运营商编号(含业务属性);组织编号' ,
    `operator_name` VARCHAR(100) NOT NULL  COMMENT '运营商名称' ,
    `operator_short_name` VARCHAR(50)   COMMENT '运营商简称' ,
    `operator_status_flag` TINYINT NOT NULL  COMMENT '运营商状态' ,
    `org_id` VARCHAR(32) NOT NULL  COMMENT '关联组织ID;一级组织id（组织-》运营商）' ,
    `corporate_id` BIGINT UNSIGNED NOT NULL  COMMENT '企业标识' ,
    `expire_date` DATETIME NOT NULL  COMMENT '到期时间(资质或运营许可)' ,
    `logo_url` VARCHAR(500) NOT NULL  COMMENT '系统LOGO图片路径' ,
    `operator_desc` VARCHAR(500)   COMMENT '虚拟电厂运营商描述' ,
    `created_at` DATETIME NOT NULL  COMMENT '创建时间' ,
    `created_by` VARCHAR(32) NOT NULL  COMMENT '创建人ID' ,
    `updated_at` DATETIME   COMMENT '更新时间' ,
    `updated_by` VARCHAR(32)   COMMENT '更新人ID' ,
    `deleted_flag` TINYINT NOT NULL  COMMENT '逻辑删除标识: 0-未删除, 1-已删除' ,
    PRIMARY KEY (id)
)  COMMENT = '虚拟电厂运营商';

CREATE TABLE cfg_virtual_power_plant(
    `id` BIGINT UNSIGNED NOT NULL  COMMENT '虚拟电厂标识;(唯一标识)' ,
    `operator_id` BIGINT UNSIGNED NOT NULL  COMMENT '运营商标识;(权限：组织-》运营商-》虚拟电厂)' ,
    `vpp_code` VARCHAR(64) NOT NULL  COMMENT '虚拟电厂编号;二级组织编号' ,
    `vpp_name` VARCHAR(100) NOT NULL  COMMENT '虚拟电厂名称' ,
    `vpp_prov_code` VARCHAR(64) NOT NULL  COMMENT '虚拟电厂省级编号' ,
    `org_id` VARCHAR(32) NOT NULL  COMMENT '关联组织ID;二级组织id' ,
    `vpp_type_flag` TINYINT NOT NULL  COMMENT '虚拟电厂类型' ,
    `market_access_status_flag` TINYINT NOT NULL  COMMENT '市场准入状态标志' ,
    `region_code` VARCHAR(20) NOT NULL  COMMENT '所在区域' ,
    `longitude` DECIMAL(10,6) NOT NULL  COMMENT '经度' ,
    `latitude` DECIMAL(10,6) NOT NULL  COMMENT '纬度' ,
    `vpp_desc` VARCHAR(500)   COMMENT '虚拟电厂描述' ,
    `created_at` DATETIME NOT NULL  COMMENT '创建时间' ,
    `created_by` VARCHAR(32) NOT NULL  COMMENT '创建人ID' ,
    `updated_at` DATETIME   COMMENT '更新时间' ,
    `updated_by` VARCHAR(32)   COMMENT '更新人ID' ,
    `deleted_flag` TINYINT NOT NULL  COMMENT '逻辑删除标识: 0-未删除, 1-已删除' ,
    PRIMARY KEY (id)
)  COMMENT = '虚拟电厂';

CREATE TABLE cfg_corporate(
    `id` BIGINT UNSIGNED NOT NULL  COMMENT '企业标识' ,
    `credit_code` VARCHAR(50) NOT NULL  COMMENT '企业信用代码(统一社会信用代码)' ,
    `establish_date` DATE   COMMENT '成立日期' ,
    `legal_person` VARCHAR(50)   COMMENT '企业法人姓名' ,
    `legal_id_card` VARCHAR(20)   COMMENT '法人身份证号' ,
    `enterprise_address` VARCHAR(255)   COMMENT '企业地址' ,
    `region_code` VARCHAR(20)   COMMENT '所在区域编码(如行政区划代码)' ,
    `longitude` DECIMAL(10,6)   COMMENT '经度' ,
    `latitude` DECIMAL(10,6)   COMMENT '纬度' ,
    `business_license_url` VARCHAR(500)   COMMENT '营业执照图片/文件路径' ,
    `industry_type_flag` TINYINT   COMMENT '所属行业标志' ,
    `contact_desc` VARCHAR(200)   COMMENT '联系人描述' ,
    `created_at` DATETIME   COMMENT '创建时间' ,
    `created_by` VARCHAR(32)   COMMENT '创建人 ID' ,
    `updated_at` DATETIME   COMMENT '更新时间' ,
    `updated_by` VARCHAR(32)   COMMENT '更新人 ID' ,
    `deleted_flag` TINYINT NOT NULL  COMMENT '删除标志' ,
    PRIMARY KEY (id)
)  COMMENT = '企业';

CREATE TABLE cfg_contact_record(
    `id` BIGINT UNSIGNED NOT NULL  COMMENT '联系人标识' ,
    `contact_name` VARCHAR(50) NOT NULL  COMMENT '联系人姓名' ,
    `position` VARCHAR(50)   COMMENT '职务' ,
    `phone` VARCHAR(50) NOT NULL  COMMENT '联系电话' ,
    `email` VARCHAR(50)   COMMENT '联系邮箱' ,
    `contact_type_flag` TINYINT   COMMENT '联系人类型标志' ,
    `owner_type_flag` TINYINT   COMMENT '所属主体类型标志' ,
    `operator_id` BIGINT UNSIGNED   COMMENT '运营商标识' ,
    `partner_id` BIGINT UNSIGNED   COMMENT '合作伙伴标识' ,
    `power_consumer_id` BIGINT UNSIGNED   COMMENT '用电户标识' ,
    `power_generator_id` BIGINT UNSIGNED   COMMENT '发电户标识' ,
    `contact_desc` VARCHAR(200)   COMMENT '联系人描述' ,
    `created_at` DATETIME   COMMENT '创建时间' ,
    `created_by` VARCHAR(32)   COMMENT '创建人 ID' ,
    `updated_at` DATETIME   COMMENT '更新时间' ,
    `updated_by` VARCHAR(32)   COMMENT '更新人 ID' ,
    `deleted_flag` TINYINT NOT NULL  COMMENT '删除标志' ,
    PRIMARY KEY (id)
)  COMMENT = '联系人';
