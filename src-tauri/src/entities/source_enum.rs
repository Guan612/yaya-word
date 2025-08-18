// In src-tauri/src/entities/source_enum.rs

use serde::{Deserialize, Serialize};
use std::str::FromStr;

// 移除了所有 sea-orm 的 derive 宏，只保留基础功能
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum Source {
    ElementarySchool,
    JuniorHighSchool,
    HighSchool,
    Cet4,
    Cet6,
    Custom,
    Other,
}

// ---- 我们手动为它实现与 String 的转换 ----

// 实现 AsRef<str>，方便从 enum 获取 &str
impl AsRef<str> for Source {
    fn as_ref(&self) -> &str {
        match self {
            Source::ElementarySchool => "ElementarySchool",
            Source::JuniorHighSchool => "JuniorHighSchool",
            Source::HighSchool => "HighSchool",
            Source::Cet4 => "CET4",
            Source::Cet6 => "CET6",
            Source::Custom => "Custom",
            Source::Other => "Other",
        }
    }
}

// 实现 FromStr，方便从 &str 创建 enum
impl FromStr for Source {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "ElementarySchool" => Ok(Source::ElementarySchool),
            "JuniorHighSchool" => Ok(Source::JuniorHighSchool),
            "HighSchool" => Ok(Source::HighSchool),
            "CET4" => Ok(Source::Cet4),
            "CET6" => Ok(Source::Cet6),
            "Custom" => Ok(Source::Custom),
            "Other" => Ok(Source::Other),
            _ => Err(()),
        }
    }
}
