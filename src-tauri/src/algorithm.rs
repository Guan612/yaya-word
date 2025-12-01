use chrono::{DateTime, Duration, Utc};
#[derive(Debug, Clone, Copy)]
pub enum Rating {
    Again = 1,
    Hard = 2,
    Good = 3,
    Easy = 4,
}

impl Rating {
    pub fn from_i32(v: i32) -> Option<Self> {
        match v {
            1 => Some(Self::Again),
            2 => Some(Self::Hard),
            3 => Some(Self::Good),
            4 => Some(Self::Easy),
            _ => None,
        }
    }
}

// 算法的输入输出结构
pub struct ReviewResult {
    pub new_stability: f32,
    pub new_difficulty: f32,
    pub next_due: DateTime<Utc>,
}

//计算函数

pub fn calculate_next_review(
    current_stability: f32,
    current_difficulty: f32,
    rating: Rating,
) -> ReviewResult {
    let mut s = current_stability;
    let mut d = current_difficulty;

    // 1. 更新难度 (Difficulty)
    // 简单的线性调整：答错加难度，答对减难度
    let d_delta = match rating {
        Rating::Again => 0.4,
        Rating::Hard => 0.2,
        Rating::Good => -0.1,
        Rating::Easy => -0.3,
    };

    d = (d + d_delta).max(1.0).min(10.0); // 限制范围 1.0 ~ 10.0

    // 2. 更新稳定性 (Stability) - 也就是下一次复习的间隔天数

    if s == 0.0 {
        //新单词
        s = match rating {
            Rating::Again => 0.1, //马上复习
            Rating::Hard => 1.0,  //一天
            Rating::Good => 3.0,  //三天
            Rating::Easy => 7.0,  //7天
        };
    } else {
        match rating {
            Rating::Again => s = 0.5,
            Rating::Hard => s = s * 1.2,
            Rating::Good => s = s * (1.0 + (11.0 - d) / 5.0), // 正常增长，难度越低增长越快
            Rating::Easy => s = s * (1.0 + (11.0 - d) / 3.0), // 快速增长
        }
    }

    //修改忘记算法
    let next_due = if let Rating::Again = rating {
        Utc::now() + Duration::seconds(3)
    } else {
        Utc::now() + Duration::minutes((s * 24.0 * 60.0) as i64)
    };

    ReviewResult {
        new_stability: s,
        new_difficulty: d,
        next_due,
    }
}
