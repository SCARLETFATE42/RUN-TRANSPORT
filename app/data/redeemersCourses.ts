export interface RedeemersCourseGroup {
  faculty: string;
  courses: string[];
}

// Source: Redeemer's University full-time undergraduate programmes page.
export const REDEEMERS_COURSE_GROUPS: RedeemersCourseGroup[] = [
  {
    faculty: "Faculty of Basic Medical Sciences",
    courses: [
      "Biochemistry",
      "Human Anatomy",
      "Human Physiology",
      "Public Health",
      "Nursing Science",
      "Physiotherapy",
      "Medical Laboratory Science",
    ],
  },
  {
    faculty: "Faculty of Education",
    courses: [
      "B.E. Educational Technology",
      "B.Tech. Ed. Technical Education",
      "B.Ed. Industrial Technology Education",
      "B.Ed. Educational Management",
    ],
  },
  {
    faculty: "Faculty of Engineering",
    courses: [
      "Civil Engineering",
      "Computer Engineering",
      "Electrical & Electronic Engineering",
      "Mechanical Engineering",
    ],
  },
  {
    faculty: "Faculty of Built Environment Studies",
    courses: [
      "Architecture",
      "Building Technology",
      "Estate Management",
      "Quantity Surveying",
      "Urban & Regional Planning",
    ],
  },
  {
    faculty: "Faculty of Humanities",
    courses: [
      "Christian Religious Studies",
      "English",
      "French",
      "History & International Studies",
      "Philosophy",
      "Theatre Arts",
    ],
  },
  {
    faculty: "Faculty of Law",
    courses: ["Law"],
  },
  {
    faculty: "Faculty of Management Sciences",
    courses: [
      "Accounting",
      "Banking & Finance",
      "Business Administration",
      "Public Administration",
      "Hospitality & Tourism Management",
      "Insurance",
      "Marketing",
      "Transport Management",
      "Actuarial Science",
    ],
  },
  {
    faculty: "Faculty of Natural Sciences",
    courses: [
      "Environmental Management & Toxicology",
      "Geology",
      "Industrial Chemistry",
      "Industrial Mathematics",
      "Industrial Mathematics and Computer Science",
      "Microbiology",
      "Petroleum Chemistry",
      "Physics with Electronics",
      "Statistics",
      "Statistics & Data Science",
    ],
  },
  {
    faculty: "Faculty of Social Sciences",
    courses: [
      "Economics",
      "Mass Communication",
      "Political Science",
      "Psychology",
      "Sociology",
      "Social Work",
    ],
  },
  {
    faculty: "Faculty of Computing and Digital Technology",
    courses: ["Computer Science", "Cyber Security", "Information Technology"],
  },
];

export const REDEEMERS_COURSES = REDEEMERS_COURSE_GROUPS.flatMap(
  (group) => group.courses,
);
