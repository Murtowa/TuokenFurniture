const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber
} = require('docx');

// ---- Shared Styles ----
const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const headerBg = { fill: "2C2416", type: ShadingType.CLEAR };
const altRowBg = { fill: "FAF8F5", type: ShadingType.CLEAR };
const PAGE_WIDTH = 11906;  // A4
const PAGE_HEIGHT = 16838;
const CONTENT_WIDTH = 9026; // A4 - 2*1440 margins

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: headerBg,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, font: "Arial", size: 22, color: "FFFFFF" })] })]
  });
}

function dataCell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading || undefined,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, font: "Arial", size: 21, color: "333333" })]
    })]
  });
}

// ---- BUILD DOCUMENT ----
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 24 } }
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "2C2416" },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: "2C2416" },
        paragraph: { spacing: { before: 280, after: 180 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "4A4030" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },

  sections: [
    // ==================== COVER PAGE ====================
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        new Paragraph({ spacing: { before: 2800 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Web应用开发实训", font: "Arial", size: 52, bold: true, color: "2C2416" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "项目文档", font: "Arial", size: 52, bold: true, color: "2C2416" })]
        }),
        // Decorative line
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "8B6914", space: 1 } },
          children: []
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: "拓肯家具电商平台", font: "Arial", size: 36, color: "8B6914" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: "Tuoken Furniture E-Commerce Platform", font: "Arial", size: 24, color: "8C8170", italics: true })]
        }),
        new Paragraph({ spacing: { before: 1600 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "院（系）：计算机学院", font: "Arial", size: 24, color: "555555" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "专业班级：软件工程 2402 班", font: "Arial", size: 24, color: "555555" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "学号：245102030404", font: "Arial", size: 24, color: "555555" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "姓名：黄家晟", font: "Arial", size: 24, color: "555555" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "日期：2026年6月", font: "Arial", size: 24, color: "555555" })] }),
      ]
    },

    // ==================== SECTION 1: 设计任务 ====================
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "8B6914", space: 4 } },
            children: [new TextRun({ text: "拓肯家具电商平台 — 项目文档", font: "Arial", size: 18, color: "8C8170" })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "第 ", font: "Arial", size: 18, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" }), new TextRun({ text: " 页", font: "Arial", size: 18, color: "999999" })]
          })]
        })
      },
      children: [
        // Section Title
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("1  设计任务")]
        }),

        // 1.1 设计目的
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("1.1  设计目的")]
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({
            text: "随着互联网技术的快速发展，电子商务已成为现代商业活动的重要组成部分。本项目的设计目的是开发一个面向终端消费者的家具电商平台——\u201C拓肯家具\u201D（Tuoken Furniture），为用户提供便捷、高效的在线家具购物体验。",
            font: "Arial", size: 24, color: "333333"
          })]
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({
            text: "本项目旨在通过现代Web前端技术，构建一个功能完善、界面美观、交互流畅的电商前台系统。系统以Vue 3框架为核心，结合Element-Plus组件库和Pinia状态管理，实现商品浏览、购物车管理、订单结算、用户认证与个人信息管理等核心购物功能。通过本项目的设计与开发，将课堂所学的Web应用开发理论知识应用于实际项目实践中，掌握前后端分离架构下的前端开发流程与技术要点。",
            font: "Arial", size: 24, color: "333333"
          })]
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({
            text: "（示例）",
            font: "Arial", size: 24, color: "8C8170", italics: true
          })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({
            text: "2020年以来家居行业电商渗透率持续提升，消费者越来越倾向于在线选购家具产品。然而，家具品类具有单价高、决策周期长、注重实物体验等特点，对电商平台的设计提出了更高要求。拓肯家具电商平台针对上述痛点，提供高清图片展示、详细的商品信息、流畅的购物流程和完善的售后服务，致力于打造高品质的线上家具购物目的地，让用户足不出户即可完成从浏览到下单的全流程购物体验。",
            font: "Arial", size: 24, color: "333333"
          })]
        }),

        // 1.2 设计要求
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("1.2  设计要求")]
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({
            text: "基于电商平台的实际业务需求，本项目的前台系统需要满足以下设计要求：",
            font: "Arial", size: 24, color: "333333"
          })]
        }),

        // 1.2.1
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun("1.2.1  \"前端\"设计要求")]
        }),

        // (1)
        new Paragraph({
          spacing: { before: 160 },
          children: [new TextRun({ text: "（1）用户界面设计要求", font: "Arial", size: 24, bold: true, color: "2C2416" })]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({
            text: "前端界面应采用现代化设计风格，以暖色调（主色#8B6914 金棕色）为基础，营造高端、温馨的家具品牌氛围。页面布局需遵循清晰的信息架构，确保用户能够快速定位所需商品。所有页面使用响应式设计，适配不同屏幕尺寸的设备。导航栏、面包屑导航等辅助元素应提供良好的空间导航体验，降低用户迷失感。",
            font: "Arial", size: 24, color: "333333"
          })]
        }),

        // (2)
        new Paragraph({
          spacing: { before: 160 },
          children: [new TextRun({ text: "（2）功能模块设计要求", font: "Arial", size: 24, bold: true, color: "2C2416" })]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({
            text: "前台系统需完整实现以下功能模块：首页展示模块（轮播图Banner、商品分类导航、热门商品推荐）、商品浏览模块（分类筛选、关键词搜索、多维度排序、分页加载）、商品详情模块（图片画廊预览、库存状态显示、数量选择、加入购物车与立即购买）、购物车模块（商品增删改查、多选结算、未登录本地缓存与登录后合并）、结算下单模块（收货地址管理、订单商品确认、备注填写、订单提交）、用户认证模块（注册、登录、退出，采用JWT Token认证机制）、个人中心模块（个人信息编辑、收货地址增删改查与管理、订单查看与取消）。此外，系统需具备路由守卫机制，未登录用户访问需认证页面时自动跳转到登录页，登录后回跳原目标页面。",
            font: "Arial", size: 24, color: "333333"
          })]
        }),

        // (3)
        new Paragraph({
          spacing: { before: 160 },
          children: [new TextRun({ text: "（3）技术规范要求", font: "Arial", size: 24, bold: true, color: "2C2416" })]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({
            text: "前端采用Vue 3 Composition API编写，使用Vite作为构建工具。状态管理统一使用Pinia，路由管理使用Vue Router 4。UI组件库采用Element-Plus，样式使用SCSS预处理器编写。HTTP请求通过Axios封装，统一设置baseURL（/api）和超时时间（10秒），请求拦截器自动附加JWT Token认证头，响应拦截器统一处理状态码（200/401/403）和业务错误码（code/message/data）。代码遵循模块化组织原则，按功能维度划分目录结构（api/、views/、stores/、router/、utils/、layouts/），确保代码可维护性和可扩展性。",
            font: "Arial", size: 24, color: "333333"
          })]
        }),

        // 1.3 设计指标
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("1.3  设计指标")]
        }),
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({
            text: "本项目的设计评价指标包括页面美化、功能实现、用户体验和响应式适配等方面，各项指标的具体权重与得分情况如表1.1所示。（表格结构参考模板，内容根据本项目实际情况填写）",
            font: "Arial", size: 24, color: "333333"
          })]
        }),
        // Table 1.1
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "表1.1  设计指标评价表（参考格式，实际数据见第2章需求分析后确认）", font: "Arial", size: 20, color: "666666", italics: true })]
        }),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [800, 2200, 1600, 1600, 2826],
          rows: [
            new TableRow({ children: [
              headerCell("序号", 800), headerCell("指标", 2200), headerCell("权重(%)", 1600), headerCell("得分(%)", 1600), headerCell("备注", 2826)
            ]}),
            new TableRow({ children: [
              dataCell("1", 800, { center: true }), dataCell("页面美化", 2200), dataCell("70", 1600, { center: true }), dataCell("60", 1600, { center: true }), dataCell("界面美观大方，设计风格统一协调", 2826)
            ]}),
            new TableRow({ children: [
              dataCell("2", 800, { center: true, shading: altRowBg }), dataCell("功能实现", 2200, { shading: altRowBg }), dataCell("60", 1600, { center: true, shading: altRowBg }), dataCell("70", 1600, { center: true, shading: altRowBg }), dataCell("购物、登录等核心功能完整可用", 2826, { shading: altRowBg })
            ]}),
            new TableRow({ children: [
              dataCell("3", 800, { center: true }), dataCell("用户体验", 2200), dataCell("50", 1600, { center: true }), dataCell("100", 1600, { center: true }), dataCell("操作流畅自然，交互反馈及时", 2826)
            ]}),
            new TableRow({ children: [
              dataCell("4", 800, { center: true, shading: altRowBg }), dataCell("响应式适配", 2200, { shading: altRowBg }), dataCell("60", 1600, { center: true, shading: altRowBg }), dataCell("100", 1600, { center: true, shading: altRowBg }), dataCell("多端显示正常，布局自适应", 2826, { shading: altRowBg })
            ]}),
            new TableRow({ children: [
              dataCell("5", 800, { center: true }), dataCell("代码规范", 2200), dataCell("—", 1600, { center: true }), dataCell("—", 1600, { center: true }), dataCell("代码结构清晰，命名规范统一", 2826)
            ]}),
          ]
        }),

        // 1.4 设计内容
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400 },
          children: [new TextRun("1.4  设计内容")]
        }),
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({
            text: "本项目的前台客户端设计内容包括前端页面开发、功能模块实现以及项目文档撰写，具体交付内容如表1.2所示。",
            font: "Arial", size: 24, color: "333333"
          })]
        }),
        // Table 1.2
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "表1.2  设计内容清单（前台客户购物模块）", font: "Arial", size: 20, color: "666666", italics: true })]
        }),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [800, 3000, 5226],
          rows: [
            new TableRow({ children: [
              headerCell("序号", 800), headerCell("内容", 3000), headerCell("说明", 5226)
            ]}),
            new TableRow({ children: [
              dataCell("1", 800, { center: true }), dataCell("项目文档", 3000), dataCell("设计任务书、需求分析文档、详细设计文档等", 5226)
            ]}),
            new TableRow({ children: [
              dataCell("2", 800, { center: true, shading: altRowBg }), dataCell("前端页面", 3000, { shading: altRowBg }), dataCell("首页、商品列表页、商品详情页、购物车页、结算页、登录页、注册页、个人中心页、订单列表页共9个核心页面", 5226, { shading: altRowBg })
            ]}),
            new TableRow({ children: [
              dataCell("3", 800, { center: true }), dataCell("用户认证模块", 3000), dataCell("用户注册、用户登录、JWT Token管理、路由守卫与登录拦截", 5226)
            ]}),
            new TableRow({ children: [
              dataCell("4", 800, { center: true, shading: altRowBg }), dataCell("商品浏览模块", 3000, { shading: altRowBg }), dataCell("Banner轮播图、商品分类导航（父子层级）、商品列表（筛选/搜索/排序/分页）、商品详情（图片画廊/库存/数量选择）", 5226, { shading: altRowBg })
            ]}),
            new TableRow({ children: [
              dataCell("5", 800, { center: true }), dataCell("购物车模块", 3000), dataCell("购物车增删改查、多选结算、未登录本地缓存、登录后自动合并到服务端", 5226)
            ]}),
            new TableRow({ children: [
              dataCell("6", 800, { center: true, shading: altRowBg }), dataCell("订单结算模块", 3000, { shading: altRowBg }), dataCell("收货地址管理（增删改/设默认）、订单商品确认、备注填写、订单提交", 5226, { shading: altRowBg })
            ]}),
            new TableRow({ children: [
              dataCell("7", 800, { center: true }), dataCell("个人中心模块", 3000), dataCell("个人信息编辑（昵称/手机号）、收货地址管理、订单列表查看与取消", 5226)
            ]}),
            new TableRow({ children: [
              dataCell("8", 800, { center: true, shading: altRowBg }), dataCell("PPT演示文稿", 3000, { shading: altRowBg }), dataCell("项目答辩演示PPT，展示系统功能与设计思路", 5226, { shading: altRowBg })
            ]}),
          ]
        }),

        // 1.5 开发工具
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400 },
          children: [new TextRun("1.5  开发工具")]
        }),
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({
            text: "本项目开发过程中使用的主要工具软件及其用途如表1.3所示。",
            font: "Arial", size: 24, color: "333333"
          })]
        }),
        // Table 1.3
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "表1.3  开发工具清单", font: "Arial", size: 20, color: "666666", italics: true })]
        }),
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [800, 2500, 2200, 3526],
          rows: [
            new TableRow({ children: [
              headerCell("序号", 800), headerCell("工具", 2500), headerCell("用途", 2200), headerCell("说明", 3526)
            ]}),
            new TableRow({ children: [
              dataCell("1", 800, { center: true }), dataCell("VSCode", 2500), dataCell("代码编辑器", 2200), dataCell("前端代码编写与调试，支持Vue/SCSS/JS语法高亮与智能提示", 3526)
            ]}),
            new TableRow({ children: [
              dataCell("2", 800, { center: true, shading: altRowBg }), dataCell("Navicat", 2500, { shading: altRowBg }), dataCell("数据库管理工具", 2200, { shading: altRowBg }), dataCell("MySQL数据库可视化管理，支持表结构设计、数据查询与导入导出", 3526, { shading: altRowBg })
            ]}),
            new TableRow({ children: [
              dataCell("3", 800, { center: true }), dataCell("MySQL", 2500), dataCell("关系型数据库", 2200), dataCell("存储用户、商品、订单、分类等业务数据", 3526)
            ]}),
            new TableRow({ children: [
              dataCell("4", 800, { center: true, shading: altRowBg }), dataCell("Microsoft StarUML", 2500, { shading: altRowBg }), dataCell("UML建模工具", 2200, { shading: altRowBg }), dataCell("绘制用例图、类图、时序图等系统设计图表", 3526, { shading: altRowBg })
            ]}),
            new TableRow({ children: [
              dataCell("5", 800, { center: true }), dataCell("浏览器开发者工具", 2500), dataCell("前端调试与测试", 2200), dataCell("Chrome/Edge DevTools，用于页面调试、网络请求监控、性能分析", 3526)
            ]}),
          ]
        }),

      ]
    }
  ]
});

// ---- WRITE FILE ----
const outPath = "D:/sd card/shixun/TuokenFurniture/docs/项目文档-第一节.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("Document created: " + outPath);
}).catch(err => {
  console.error("Error creating document:", err);
  process.exit(1);
});
