using System;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities.Commands;

public class UpdateAttendance
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string Id { get; set; }
    }

    public class Handler(IUserAccessor userAccessor, AppDbContext context) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
                           .Include(x => x.Attendees)
                           .ThenInclude(x => x.User)
                           .SingleOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (activity == null) return Result<Unit>.Failure("Activity not found", 404);

            var user = await userAccessor.GetUserAsync();

            var attendance = activity.Attendees.FirstOrDefault(x => x.User.Id == user.Id);
            var isHost = activity.Attendees.Any(x => x.User.Id == user.Id && x.IsHost);

            if(attendance != null)
            {
                // user is already attending
                if(isHost)
                {
                    // toggle activity cancellation
                    activity.IsCancelled = !activity.IsCancelled;
                }
                else
                {
                    // remove attendance
                    activity.Attendees.Remove(attendance);
                }
            }
            else
            {
                // add new attendance
                activity.Attendees.Add(new ActivityAttendee
                {
                    UserId = user.Id,
                    ActivityId = activity.Id,
                    IsHost = false
                });
            }

            var result = await context.SaveChangesAsync(cancellationToken) > 0;
            return result 
                ? Result<Unit>.Success(Unit.Value) 
                : Result<Unit>.Failure("Problem updating attendance", 400);
        }
    }

}
