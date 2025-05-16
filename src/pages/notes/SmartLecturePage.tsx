// src/pages/lecture/SmartLectureLayout.tsx
import { Layout, Card, Row, Col } from 'antd';

const { Content } = Layout;

const SmartLectureLayout = () => {
  return (
    <Layout className="lecture-layout">
      <Content className="lecture-content">
        <Row gutter={24}>
          {/* 主内容区 (3:1 比例) */}
          <Col xs={24} md={18}>
            <Card
              title="AI智能讲解"
              className="main-card"
              extra={<div className="play-controls">播放控制占位</div>}
            >
              {/* 思维导图容器 */}
              <div className="mindmap-container">
                <div className="node-placeholder">中心主题节点</div>
              </div>

              {/* 时间轴占位 */}
              <div className="timeline-placeholder">
                <div className="progress-bar" />
              </div>

              {/* 字幕区域 */}
              <div className="subtitle-area">
                <p className="subtitle-text">当前讲解字幕内容...</p>
              </div>
            </Card>
          </Col>

          {/* 问答侧边栏 */}
          <Col xs={24} md={6}>
            <Card
              title="智能问答"
              className="sidebar-card"
            >
              {/* 问答记录 */}
              <div className="qna-list">
                <div className="qna-item user">用户问题示例</div>
                <div className="qna-item bot">AI回答示例</div>
              </div>

              {/* 输入框 */}
              <div className="question-input">
                <input placeholder="输入问题..." />
                <button>发送</button>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default SmartLectureLayout;
