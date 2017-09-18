package com.yc.learn.entity;

import java.io.Serializable;
import org.nutz.dao.entity.annotation.Column;
import org.nutz.dao.entity.annotation.EL;
import org.nutz.dao.entity.annotation.Name;
import org.nutz.dao.entity.annotation.Prev;

public class BaseEntity implements Serializable {

	private static final long serialVersionUID = 1L;

	//标识
	@Name
	@Column("c_id")
	@Prev(els=@EL("$me.genID()"))
	private String id;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String genID() {
		return java.util.UUID.randomUUID().toString().replace("-", "");
	}
}
