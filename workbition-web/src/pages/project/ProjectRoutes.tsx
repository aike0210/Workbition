import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import ProjectDetailPage from './ProjectDetailPage'
import ProjectOverview from './ProjectOverview'
import BoardViewPage from './BoardViewPage'
import ListViewPage from './ListViewPage'
import MembersPage from './MembersPage'
import ProjectSettings from './ProjectSettings'
import WorkflowConfigPage from '../workflow/WorkflowConfigPage'
import AutomationRulesPage from '../workflow/AutomationRulesPage'

const ProjectRoutes = () => {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <Routes>
      <Route path="/" element={<ProjectDetailPage />}>
        <Route index element={<ProjectOverview />} />
        <Route path="board" element={<BoardViewPage />} />
        <Route path="list" element={<ListViewPage />} />
        <Route path="calendar" element={<div>日历视图（开发中）</div>} />
        <Route path="gantt" element={<div>甘特图视图（开发中）</div>} />
        <Route path="members" element={<MembersPage />} />
        <Route path="workflow" element={<WorkflowConfigPage />} />
        <Route path="automation" element={<AutomationRulesPage />} />
        <Route path="settings" element={<ProjectSettings />} />
      </Route>
    </Routes>
  )
}

export default ProjectRoutes