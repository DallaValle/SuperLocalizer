import React from 'react'
import './PlansMatrix.css'

export default function PlansMatrix() {
    return (
        <div className="plans-matrix">
            <div className="plans-table">
                <div className="plans-row plans-header">
                    <div className="plans-cell"></div>
                    <div className="plans-cell plans-col">free</div>
                    <div className="plans-cell plans-col">essential</div>
                    <div className="plans-cell plans-col">hero</div>
                </div>

                <div className="plans-row">
                    <div className="plans-cell">Price</div>
                    <div className="plans-cell">$0</div>
                    <div className="plans-cell">$9/mo</div>
                    <div className="plans-cell">$29/mo</div>
                </div>

                <div className="plans-row">
                    <div className="plans-cell">Projects</div>
                    <div className="plans-cell">1</div>
                    <div className="plans-cell">5</div>
                    <div className="plans-cell">Unlimited</div>
                </div>

                <div className="plans-row">
                    <div className="plans-cell">Auto-translate</div>
                    <div className="plans-cell">No</div>
                    <div className="plans-cell">Yes (limited)</div>
                    <div className="plans-cell">Yes (full)</div>
                </div>

                <div className="plans-row">
                    <div className="plans-cell">Real human experts verification</div>
                    <div className="plans-cell">No</div>
                    <div className="plans-cell">Still no :(</div>
                    <div className="plans-cell">Yes (ch, de, en, fr, it)</div>
                </div>

                <div className="plans-row">
                    <div className="plans-cell">Automation</div>
                    <div className="plans-cell">Api endpoints</div>
                    <div className="plans-cell">Git Hub</div>
                    <div className="plans-cell">All</div>
                </div>

                <div className="plans-row">
                    <div className="plans-cell">Support</div>
                    <div className="plans-cell">Community</div>
                    <div className="plans-cell">Email</div>
                    <div className="plans-cell">Priority</div>
                </div>

                <div className="plans-row">
                    <div className="plans-cell">Actions</div>
                    <div className="plans-cell"><a href="/signup" className="get-started-button">Get free</a></div>
                    <div className="plans-cell"><a href="/signup" className="get-started-button">Essential</a></div>
                    <div className="plans-cell"><a href="/signup" className="get-started-button">Be a hero</a></div>
                </div>
            </div>
        </div>
    )
}
