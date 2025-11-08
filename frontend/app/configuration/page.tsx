'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { CompanyService } from '../services/CompanyService'
import { ProjectService } from '../services/ProjectService'
import { InvitationService } from '../services/InvitationService'
import type { Company, Project, User } from '../types/domain'
import './configuration.css'

export default function ConfigurationPage() {
    const { data: session, status, update } = useSession()
    const user = session?.user as User || null
    const authLoading = status === 'loading'
    const [company, setCompany] = useState<Company | null>(null)
    const [projects, setProjects] = useState<Project[]>([])
    const [creating, setCreating] = useState<boolean>(false)
    const [creatingProject, setCreatingProject] = useState<boolean>(false)
    const [settingMainProject, setSettingMainProject] = useState<number | null>(null)
    const [form, setForm] = useState<Partial<Company>>({ name: '', address: '', email: '', phone: '' })
    const [projectForm, setProjectForm] = useState<Partial<Project>>({ name: '', description: '' })
    const [error, setError] = useState<string | null>(null)
    const [projectError, setProjectError] = useState<string | null>(null)
    const [invitationToken, setInvitationToken] = useState<string | null>(null)
    const [creatingInvitation, setCreatingInvitation] = useState<boolean>(false)
    const [invitationError, setInvitationError] = useState<string | null>(null)

    // Function to refresh user session after company/project changes
    const refreshUserSession = async () => {
        try {
            // NextAuth refresh the session
            await update();
        } catch (error) {
            console.error('Failed to refresh user session:', error);
        }
    };

    useEffect(() => {
        const load = async () => {
            // Wait for auth to be ready and user to be available
            if (authLoading || !user) {
                return;
            }

            try {
                // Only call services when companyId is not null/undefined
                if (user?.companyId != null) {
                    const data = await CompanyService.getCompany(user.companyId)
                    setCompany(data)

                    // Load projects for this company
                    const projectData = await ProjectService.getAllProjects(user.companyId)
                    setProjects(projectData)
                }
            } catch (err) {
                console.error('Failed to load company/projects', err)
                // If no company found, that's expected for new users
                setCompany(null)
                setProjects([])
            }
        }
        load()
    }, [user, authLoading])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setProjectForm(prev => ({ ...prev, [name]: value }))
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!form.name) {
            setError('Company name is required')
            return
        }
        try {
            setCreating(true)
            const created = await CompanyService.createCompany(form)
            setCompany(created)

            // Refresh session to update user's companyId and companyName
            await refreshUserSession()
        } catch (err) {
            console.error('Failed to create company', err)
            setError('Failed to create company')
        } finally {
            setCreating(false)
        }
    }

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault()
        setProjectError(null)
        if (!projectForm.name) {
            setProjectError('Project name is required')
            return
        }
        if (!company?.id) {
            setProjectError('Company must be created first')
            return
        }
        try {
            setCreatingProject(true)
            const created = await ProjectService.createProject(company.id, projectForm)
            setProjects(prev => [...prev, created])
            setProjectForm({ name: '', description: '' })
            // NextAuth automatically manages session refreshing
        } catch (err) {
            console.error('Failed to create project', err)
            setProjectError('Failed to create project')
        } finally {
            setCreatingProject(false)
        }
    }

    const handleSetMainProject = async (projectId: number) => {
        if (!company?.id) return

        try {
            setSettingMainProject(projectId)
            await ProjectService.setMainProject(company.id, projectId)

            // Refresh session to update user's mainProjectId and mainProjectName
            await refreshUserSession()
        } catch (err) {
            console.error('Failed to set main project', err)
            // Could add error state here if needed
        } finally {
            setSettingMainProject(null)
        }
    }

    const handleCreateInvitation = async () => {
        setInvitationError(null)
        try {
            setCreatingInvitation(true)
            const response = await InvitationService.createInvitation()
            setInvitationToken(response.token)
        } catch (err) {
            console.error('Failed to create invitation', err)
            setInvitationError('Failed to create invitation')
        } finally {
            setCreatingInvitation(false)
        }
    }

    const handleCopyInvitationLink = () => {
        if (invitationToken) {
            const invitationUrl = InvitationService.generateInvitationUrl(invitationToken)
            navigator.clipboard.writeText(invitationUrl)
                .then(() => {
                    // Could show a toast notification here
                    console.log('Invitation link copied to clipboard')
                })
                .catch(err => {
                    console.error('Failed to copy to clipboard', err)
                })
        }
    }

    return (
        <div className="configuration-container">
            <header className="home-header">
                <div className="header-title">
                    <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="header-logo" />
                </div>
                <div className="user-info">
                    {/* <div className="account-tab">
                        <div className="account-line"><strong>Company:</strong> {user?.companyName ?? '—'}</div>
                        <div className="account-line"><strong>Project:</strong> {user?.mainProjectName ?? '—'}</div>
                    </div> */}
                    <div className="account-tab">{user && user.username ? user.username : ''}</div>
                    <button onClick={() => window.location.href = '/home'} className="back-btn">
                        ← Dashboard
                    </button>
                    <button onClick={() => signOut({ redirect: false }).then(() => window.location.href = '/login')} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <main>
                <div className='company-card'>
                    <h1>Configuration</h1>
                    <p>In this section you can set up your localization journey: create a project then start uploading a localization file</p>
                </div>
                {company ? (
                    <div className="company-card">
                        <h2>{company.name}</h2>
                        <p>{company.address}</p>
                        <p>{company.email}</p>
                        <p>{company.phone}</p>

                        <div className="invitation-section">
                            <h3>Invite Team Members</h3>
                            <p>Generate an invitation link to invite new team members to your company.</p>

                            {!invitationToken ? (
                                <div className="invitation-actions">
                                    <button
                                        onClick={handleCreateInvitation}
                                        disabled={creatingInvitation}
                                        className="invitation-btn"
                                    >
                                        {creatingInvitation ? 'Generating...' : 'Generate Invitation Link'}
                                    </button>
                                    {invitationError && <div className="form-error">{invitationError}</div>}
                                </div>
                            ) : (
                                <div className="invitation-result">
                                    <p>Invitation link generated successfully!</p>
                                    <div className="invitation-link-container">
                                        <input
                                            type="text"
                                            value={InvitationService.generateInvitationUrl(invitationToken)}
                                            readOnly
                                            className="invitation-link-input"
                                        />
                                        <button
                                            onClick={handleCopyInvitationLink}
                                            className="copy-btn"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setInvitationToken(null)}
                                        className="generate-new-btn"
                                    >
                                        Generate New Link
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="company-form">
                        <h2>Create Company</h2>
                        <form onSubmit={handleCreate}>
                            <label>
                                Name
                                <input name="name" value={form.name ?? ''} onChange={handleChange} />
                            </label>

                            <label>
                                Address
                                <input name="address" value={form.address ?? ''} onChange={handleChange} />
                            </label>

                            <label>
                                Email
                                <input name="email" value={form.email ?? ''} onChange={handleChange} />
                            </label>

                            <label>
                                Phone
                                <input name="phone" value={form.phone ?? ''} onChange={handleChange} />
                            </label>

                            {error && <div className="form-error">{error}</div>}

                            <button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Company'}</button>
                        </form>
                    </div>
                )}

                {/* Projects Section */}
                {company && (
                    <div className="projects-section">
                        <div className="company-card">
                            <h2>Projects</h2>
                            {projects.length > 0 ? (
                                <div className="projects-list">
                                    {projects.map(project => (
                                        <div key={project.id} className="project-item">
                                            <div className="project-content">
                                                <h3>{project.name}</h3>
                                                <p>{project.description}</p>
                                                <small>Created: {project.insertDate ? new Date(project.insertDate).toLocaleDateString() : 'N/A'}</small>
                                            </div>
                                            <div className="project-actions">
                                                {user?.mainProjectId === project.id ? (
                                                    <span className="main-project-badge">Main Project</span>
                                                ) : (
                                                    <button
                                                        className="main-project-btn"
                                                        onClick={() => handleSetMainProject(project.id)}
                                                        disabled={settingMainProject === project.id}
                                                    >
                                                        {settingMainProject === project.id ? 'Setting...' : 'Set as Main'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No projects created yet.</p>
                            )}
                        </div>

                        <div className="company-form">
                            <h2>Create New Project</h2>
                            <form onSubmit={handleCreateProject}>
                                <label>
                                    Project Name
                                    <input
                                        name="name"
                                        value={projectForm.name ?? ''}
                                        onChange={handleProjectChange}
                                        placeholder="Enter project name"
                                    />
                                </label>

                                <label>
                                    Description
                                    <textarea
                                        name="description"
                                        value={projectForm.description ?? ''}
                                        onChange={handleProjectChange}
                                        placeholder="Enter project description"
                                        rows={3}
                                    />
                                </label>

                                {projectError && <div className="form-error">{projectError}</div>}

                                <button type="submit" disabled={creatingProject}>
                                    {creatingProject ? 'Creating...' : 'Create Project'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
