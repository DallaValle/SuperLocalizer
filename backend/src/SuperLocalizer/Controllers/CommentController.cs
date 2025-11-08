using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using SuperLocalizer.Repository;
using SuperLocalizer.Model;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using SuperLocalizer.Services;

namespace SuperLocalizer.Controllers
{
    [Authorize]
    [ApiController]
    [Route("property/{valueKey}/comment")]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IUserProfile _userRepository;

        public CommentController(ICommentRepository commentRepository, IUserProfile userRepository)
        {
            _commentRepository = commentRepository;
            _userRepository = userRepository;
        }

        /// <summary>
        /// Get all comments for a specific value
        /// </summary>
        /// <param name="valueKey">The key of the value to get comments for</param>
        /// <returns>List of comments</returns>
        [HttpGet]
        public ActionResult<List<Comment>> GetComments(string valueKey)
        {
            try
            {
                var comments = _commentRepository.GetComments(valueKey);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Create a new comment
        /// </summary>
        /// <param name="valueKey"></param>
        /// <param name="comment">The comment to create</param>
        /// <returns>Created comment</returns>
        [HttpPost]
        public async Task<ActionResult<Comment>> CreateComment(string valueKey, [FromBody] Comment comment)
        {
            try
            {
                if (comment == null)
                {
                    return BadRequest("Comment cannot be null");
                }

                if (string.IsNullOrWhiteSpace(comment.Text))
                {
                    return BadRequest("Comment text is required");
                }

                if (string.IsNullOrWhiteSpace(comment.Author))
                {
                    return BadRequest("Comment author is required");
                }

                if (valueKey != comment.ValueKey)
                {
                    return BadRequest("Value key mismatch");
                }

                comment.Id = Guid.NewGuid();
                comment.InsertDate = DateTime.UtcNow;
                comment.UpdateDate = DateTime.UtcNow;
                comment.Author = (await _userRepository.GetCurrentUser()).Username;
                comment.ValueKey = valueKey;
                _commentRepository.Create(comment);
                return CreatedAtAction(nameof(GetComments), new { valueKey = comment.ValueKey }, comment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Update an existing comment
        /// </summary>
        /// <param name="valueKey">The value key of the comment</param>
        /// <param name="id">The ID of the comment to update</param>
        /// <param name="comment">The updated comment data</param>
        /// <returns>Updated comment</returns>
        [HttpPut("{id}")]
        public ActionResult<Comment> UpdateComment(string valueKey, Guid id, [FromBody] Comment comment)
        {
            try
            {
                if (comment == null)
                {
                    return BadRequest("Comment cannot be null");
                }

                if (id != comment.Id)
                {
                    return BadRequest("Comment ID mismatch");
                }

                if (string.IsNullOrWhiteSpace(comment.Text))
                {
                    return BadRequest("Comment text is required");
                }

                comment.UpdateDate = DateTime.UtcNow;
                _commentRepository.Update(comment);
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete a comment
        /// </summary>
        /// <param name="valueKey">The value key of the comment</param>
        /// <param name="id">The ID of the comment to delete</param>
        /// <returns>No content on success</returns>
        [HttpDelete("{id}")]
        public ActionResult DeleteComment(string valueKey, Guid id)
        {
            try
            {
                _commentRepository.Delete(valueKey, id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}