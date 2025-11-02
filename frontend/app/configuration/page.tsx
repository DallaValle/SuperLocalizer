'use client'

import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { CompanyService } from '../services/CompanyService'
import { ProjectService } from '../services/ProjectService'
import type { Company, Project } from '../types/domain'
import './configuration.css'

export default function ConfigurationPage() {
    const { user, logout } = useAuth()
    const [company, setCompany] = useState<Company | null>(null)
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [creating, setCreating] = useState<boolean>(false)
    const [creatingProject, setCreatingProject] = useState<boolean>(false)
    const [form, setForm] = useState<Partial<Company>>({ name: '', address: '', email: '', phone: '' })
    const [projectForm, setProjectForm] = useState<Partial<Project>>({ name: '', description: '' })
    const [error, setError] = useState<string | null>(null)
    const [projectError, setProjectError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                // Try to get the current user's company first
                const data = await CompanyService.getCurrentUserCompany()
                setCompany(data)

                // Load projects for this company
                const projectData = await ProjectService.getAllProjects(data.id)
                setProjects(projectData)
            } catch (err) {
                console.error('Failed to load company/projects', err)
                // If no company found, that's expected for new users
                setCompany(null)
                setProjects([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user])

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
        } catch (err) {
            console.error('Failed to create project', err)
            setProjectError('Failed to create project')
        } finally {
            setCreatingProject(false)
        }
    }

    // if (loading) return <div className="configuration-container">Loading configuration...</div>

    return (
        <div className="configuration-container">
            <header className="home-header">
                <div className="header-title">
                    <img src="/img/superlocalizer-logo.png" alt="SuperLocalizer Logo" className="header-logo" />
                </div>
                <div className="user-info">
                    <span>{user && user.username ? user.username : ''}</span>
                    <button onClick={() => window.location.href = '/home'} className="back-btn">
                        ← Dashboard
                    </button>
                    <button onClick={() => logout()} className="logout-btn">
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
                                            <h3>{project.name}</h3>
                                            <p>{project.description}</p>
                                            <small>Created: {project.insertDate ? new Date(project.insertDate).toLocaleDateString() : 'N/A'}</small>
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
